import React, { useState, useEffect } from 'react';
import { Users, Clock, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { useUserSession } from '../utils/userSessionManager';
import { useAdminSession } from '../utils/adminSessionManager';

interface UserLimitGateProps {
  children: React.ReactNode;
  getContrastClass: (baseClass: string, contrastClass: string) => string;
}

export default function UserLimitGate({ children, getContrastClass }: UserLimitGateProps) {
  const [accessStatus, setAccessStatus] = useState<'checking' | 'granted' | 'denied'>('checking');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentUsers, setCurrentUsers] = useState(0);
  const [maxUsers, setMaxUsers] = useState(100);
  const [message, setMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [showMessage, setShowMessage] = useState(true);
  
  const { 
    requestAccess: legacyRequestAccess, 
    updateActivity: legacyUpdateActivity, 
    releaseSession: legacyReleaseSession, 
    getCurrentUserCount: legacyGetCurrentUserCount, 
    getMaxUsers: legacyGetMaxUsers,
    isSessionValid: legacyIsSessionValid 
  } = useUserSession();

  const { 
    requestAccess: adminRequestAccess, 
    updateActivity: adminUpdateActivity, 
    releaseSession: adminReleaseSession, 
    getCurrentUserCount: adminGetCurrentUserCount, 
    getMaxUsers: adminGetMaxUsers,
    isSessionValid: adminIsSessionValid,
    logActivity,
    logError
  } = useAdminSession();

  useEffect(() => {
    // Check for existing session on mount
    const existingSession = localStorage.getItem('11mercado_current_session');
    const userInfo = JSON.parse(localStorage.getItem('11mercado_user') || '{}');
    
    if (existingSession && adminIsSessionValid(existingSession)) {
      setSessionId(existingSession);
      setAccessStatus('granted');
      setCurrentUsers(adminGetCurrentUserCount());
      setMaxUsers(adminGetMaxUsers());
      setMessage(`Welcome back! You are reconnected to your session.`);
      setShowMessage(true);
      // Auto-hide message after 3 seconds
      setTimeout(() => setShowMessage(false), 3000);
      startActivityUpdater(existingSession);
      
      // Log the reconnection
      if (userInfo.firstName) {
        logActivity(existingSession, 'RECONNECT', `${userInfo.firstName} reconnected to session`, 'UserLimitGate', true);
      }
    } else {
      // Request new access with user info
      attemptAccess(userInfo);
    }

    // Cleanup on unmount
    return () => {
      if (sessionId) {
        adminReleaseSession(sessionId);
        localStorage.removeItem('11mercado_current_session');
      }
    };
  }, []);

  const attemptAccess = async (userInfo = {}) => {
    try {
      const result = await adminRequestAccess(userInfo);
      
      if (result.success && result.sessionId) {
        setAccessStatus('granted');
        setSessionId(result.sessionId);
        setCurrentUsers(result.currentUsers);
        setMaxUsers(result.maxUsers);
        setMessage(result.message);
        setShowMessage(true);
        // Auto-hide message after 3 seconds
        setTimeout(() => setShowMessage(false), 3000);
        localStorage.setItem('11mercado_current_session', result.sessionId);
        startActivityUpdater(result.sessionId);
      } else {
        setAccessStatus('denied');
        setCurrentUsers(result.currentUsers);
        setMaxUsers(result.maxUsers);
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Access request failed:', error);
      logError('unknown', 'ACCESS_ERROR', error.message, 'UserLimitGate', error.stack);
      setAccessStatus('denied');
      setMessage('An error occurred while requesting access. Please try again.');
    }
  };

  const startActivityUpdater = (sessionId: string) => {
    // Update activity every 2 minutes
    const interval = setInterval(() => {
      if (!adminUpdateActivity(sessionId)) {
        // Session expired or invalid
        setAccessStatus('denied');
        setMessage('Your session has expired after 15 minutes of inactivity. Please refresh to try again.');
        localStorage.removeItem('11mercado_current_session');
        clearInterval(interval);
        
        // Log session expiration
        logActivity(sessionId, 'SESSION_EXPIRED', 'Session expired due to inactivity', 'UserLimitGate', false, 'Session timeout');
      }
    }, 2 * 60 * 1000);

    // Store interval reference for cleanup
    (window as any).activityInterval = interval;
  };

  const handleRetry = () => {
    setAccessStatus('checking');
    setRetryCount(prev => prev + 1);
    
    setTimeout(() => {
      const userInfo = JSON.parse(localStorage.getItem('11mercado_user') || '{}');
      attemptAccess(userInfo);
    }, 1000);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (accessStatus === 'checking') {
    return (
      <div className={getContrastClass(
        "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center",
        "min-h-screen bg-black flex items-center justify-center"
      )}>
        <div className={getContrastClass(
          "bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 max-w-md text-center",
          "bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border-2 border-yellow-400/50 max-w-md text-center"
        )}>
          <div className="flex justify-center mb-4">
            <RefreshCw size={48} className={getContrastClass("text-blue-500 animate-spin", "text-yellow-400 animate-spin")} />
          </div>
          <h2 className={getContrastClass(
            "text-xl font-semibold text-gray-900 mb-2",
            "text-xl font-semibold text-yellow-400 mb-2"
          )}>
            Checking Access...
          </h2>
          <p className={getContrastClass("text-gray-600", "text-yellow-200")}>
            Verifying available slots for 11Mercado
          </p>
        </div>
      </div>
    );
  }

  if (accessStatus === 'denied') {
    return (
      <div className={getContrastClass(
        "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center",
        "min-h-screen bg-black flex items-center justify-center"
      )}>
        <div className={getContrastClass(
          "bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30 max-w-md text-center",
          "bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border-2 border-yellow-400/50 max-w-md text-center"
        )}>
          <div className="flex justify-center mb-4">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h2 className={getContrastClass(
            "text-xl font-semibold text-gray-900 mb-4",
            "text-xl font-semibold text-yellow-400 mb-4"
          )}>
            Access Limit Reached
          </h2>
          
          <div className={getContrastClass(
            "bg-red-50 border border-red-200 rounded-xl p-4 mb-4",
            "bg-gray-800 border border-red-400 rounded-xl p-4 mb-4"
          )}>
            <p className={getContrastClass("text-red-700 text-sm", "text-red-300 text-sm")}>
              {message}
            </p>
          </div>

          {/* User Count Display */}
          <div className={getContrastClass(
            "bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6",
            "bg-gray-800 border border-yellow-400 rounded-xl p-4 mb-6"
          )}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users size={20} className={getContrastClass("text-blue-600", "text-yellow-400")} />
              <span className={getContrastClass("font-semibold text-blue-800", "font-semibold text-yellow-400")}>
                Current Usage
              </span>
            </div>
            <div className={getContrastClass("text-2xl font-bold text-blue-900", "text-2xl font-bold text-yellow-300")}>
              {currentUsers} / {maxUsers}
            </div>
            <div className={getContrastClass("bg-blue-200 rounded-full h-2 mt-2", "bg-gray-700 rounded-full h-2 mt-2")}>
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all" 
                style={{ width: `${(currentUsers / maxUsers) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className={getContrastClass(
                "w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2",
                "w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              )}
            >
              <RefreshCw size={18} />
              Try Again {retryCount > 0 && `(${retryCount})`}
            </button>
            
            <button
              onClick={handleRefresh}
              className={getContrastClass(
                "w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2",
                "w-full bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              )}
            >
              <RefreshCw size={18} />
              Refresh Page
            </button>
          </div>

          <div className={getContrastClass(
            "mt-6 text-xs text-gray-500",
            "mt-6 text-xs text-yellow-300"
          )}>
            <p>💡 <strong>Tips:</strong></p>
            <p>• Users are automatically logged out after 15 minutes of inactivity</p>
            <p>• Try again in a few minutes when slots become available</p>
            <p>• Peak usage times are usually during school hours</p>
          </div>
        </div>
      </div>
    );
  }

  // Access granted - show the app (user counter moved to chatbot area)
  return (
    <div>

      {/* Success message (shows briefly) */}
      {message && showMessage && (
        <div className={getContrastClass(
          "fixed top-4 right-4 bg-green-500/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm flex items-center gap-2",
          "fixed top-4 right-4 bg-green-600/90 backdrop-blur-md border border-green-400/50 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm flex items-center gap-2"
        )}>
          <span>{message}</span>
          <button
            onClick={() => setShowMessage(false)}
            className="hover:bg-green-600 dark:hover:bg-green-700 rounded p-1 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {children}
    </div>
  );
}