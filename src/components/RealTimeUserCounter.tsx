import React, { useState, useEffect } from 'react';
import { Users, Activity, Wifi, WifiOff, Clock } from 'lucide-react';
import { useAdminSession } from '../utils/adminSessionManager';
import { useRealTimeSync } from '../utils/realTimeSync';

interface RealTimeUserCounterProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
  showDetails?: boolean;
  compact?: boolean;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'inline';
}

export default function RealTimeUserCounter({ 
  getContrastClass, 
  showDetails = false, 
  compact = false,
  position = 'top-right' 
}: RealTimeUserCounterProps) {
  const [userCount, setUserCount] = useState(0);
  const [maxUsers, setMaxUsers] = useState(80);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [showPulse, setShowPulse] = useState(false);
  
  const { getCurrentUserCount, getMaxUsers } = useAdminSession();
  const { onUserCountUpdate, getUserCount, onSystemUpdate } = useRealTimeSync();

  useEffect(() => {
    // Initial load
    updateUserCount();
    
    // Set up real-time listeners
    onUserCountUpdate((data) => {
      setUserCount(data.count);
      setLastUpdate(Date.now());
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
    });
    
    onSystemUpdate(() => {
      updateUserCount();
    });
    
    // Listen for direct session updates
    const handleUserCountUpdate = (event) => {
      updateUserCount();
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
    };
    
    window.addEventListener('userCountUpdate', handleUserCountUpdate);
    
    // Periodic refresh to ensure accuracy
    const refreshInterval = setInterval(() => {
      updateUserCount();
    }, 30000); // Every 30 seconds
    
    // Connection status check
    const connectionInterval = setInterval(() => {
      setIsConnected(navigator.onLine);
    }, 5000);
    
    return () => {
      window.removeEventListener('userCountUpdate', handleUserCountUpdate);
      clearInterval(refreshInterval);
      clearInterval(connectionInterval);
    };
  }, [onUserCountUpdate, onSystemUpdate]);

  const updateUserCount = () => {
    try {
      const currentCount = getCurrentUserCount();
      const maxCount = getMaxUsers();
      
      setUserCount(currentCount);
      setMaxUsers(maxCount);
      setLastUpdate(Date.now());
    } catch (error) {
      console.warn('Error updating user count:', error);
    }
  };

  const getPositionClass = () => {
    if (position === 'inline') return '';
    
    const basePosition = 'fixed z-50';
    switch (position) {
      case 'top-right':
        return `${basePosition} top-4 right-4`;
      case 'top-left':
        return `${basePosition} top-4 left-4`;
      case 'bottom-right':
        return `${basePosition} bottom-20 right-4`;
      case 'bottom-left':
        return `${basePosition} bottom-20 left-4`;
      default:
        return `${basePosition} top-4 right-4`;
    }
  };

  const getUsagePercentage = () => (userCount / maxUsers) * 100;
  
  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatLastUpdate = () => {
    const secondsAgo = Math.floor((Date.now() - lastUpdate) / 1000);
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  };

  if (compact) {
    return (
      <div className={`${getPositionClass()} ${getContrastClass(
        "bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg",
        "bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-lg shadow-lg"
      )}`}>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="relative">
            <Users size={16} className={getUsageColor()} />
            {showPulse && (
              <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
            )}
          </div>
          <span className={getContrastClass("text-sm font-medium text-gray-900", "text-sm font-medium text-white")}>
            {userCount}/{maxUsers}
          </span>
          {!isConnected && <WifiOff size={12} className="text-red-500" />}
        </div>
      </div>
    );
  }

  return (
    <div className={`${getPositionClass()} ${getContrastClass(
      "bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg",
      "bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg"
    )}`}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className={`p-2 rounded-lg ${getContrastClass("bg-blue-100", "bg-blue-900/50")}`}>
              <Users size={20} className={getUsageColor()} />
            </div>
            {showPulse && (
              <div className="absolute inset-0 rounded-lg bg-blue-500 animate-ping opacity-30"></div>
            )}
          </div>
          <div>
            <h3 className={getContrastClass("text-sm font-semibold text-gray-900", "text-sm font-semibold text-white")}>
              Live Users
            </h3>
            <p className={getContrastClass("text-xs text-gray-600", "text-xs text-gray-400")}>
              Real-time count
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-white")}>
              {userCount}
            </span>
            <span className={getContrastClass("text-sm text-gray-600", "text-sm text-gray-400")}>
              / {maxUsers}
            </span>
          </div>

          {/* Usage bar */}
          <div className={getContrastClass("bg-gray-200 rounded-full h-2", "bg-gray-700 rounded-full h-2")}>
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                getUsagePercentage() >= 90 ? 'bg-red-500' : 
                getUsagePercentage() >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className={getUsageColor()}>
              {getUsagePercentage().toFixed(1)}% capacity
            </span>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <>
                  <Wifi size={10} className="text-green-500" />
                  <span className={getContrastClass("text-green-600", "text-green-400")}>Live</span>
                </>
              ) : (
                <>
                  <WifiOff size={10} className="text-red-500" />
                  <span className={getContrastClass("text-red-600", "text-red-400")}>Offline</span>
                </>
              )}
            </div>
          </div>

          {showDetails && (
            <div className={`mt-3 pt-3 border-t ${getContrastClass("border-gray-200", "border-gray-700")}`}>
              <div className="flex items-center gap-2 text-xs">
                <Clock size={10} className={getContrastClass("text-gray-500", "text-gray-400")} />
                <span className={getContrastClass("text-gray-600", "text-gray-400")}>
                  Updated {formatLastUpdate()}
                </span>
              </div>
              
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className={getContrastClass("bg-green-50 rounded-lg p-2", "bg-green-900/20 rounded-lg p-2")}>
                  <div className={getContrastClass("text-green-700 font-medium", "text-green-400 font-medium")}>
                    Available
                  </div>
                  <div className={getContrastClass("text-green-900 font-bold", "text-green-300 font-bold")}>
                    {maxUsers - userCount}
                  </div>
                </div>
                <div className={getContrastClass("bg-blue-50 rounded-lg p-2", "bg-blue-900/20 rounded-lg p-2")}>
                  <div className={getContrastClass("text-blue-700 font-medium", "text-blue-400 font-medium")}>
                    Active
                  </div>
                  <div className={getContrastClass("text-blue-900 font-bold", "text-blue-300 font-bold")}>
                    {userCount}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}