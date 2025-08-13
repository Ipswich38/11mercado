import React, { useState, useEffect } from 'react';
import { Users, Clock, Eye, RefreshCw, Shield } from 'lucide-react';
import { useUserSession } from '../utils/userSessionManager';

interface AdminMonitorProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
}

export default function AdminMonitor({ getContrastClass }: AdminMonitorProps) {
  const [currentUsers, setCurrentUsers] = useState(0);
  const [maxUsers, setMaxUsers] = useState(100);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { getCurrentUserCount, getMaxUsers } = useUserSession();

  const updateStats = () => {
    setCurrentUsers(getCurrentUserCount());
    setMaxUsers(getMaxUsers());
    setLastUpdate(new Date());
  };

  useEffect(() => {
    updateStats();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(updateStats, 5000); // Update every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const usagePercentage = (currentUsers / maxUsers) * 100;
  const getUsageColor = () => {
    if (usagePercentage >= 90) return 'text-red-500';
    if (usagePercentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getUsageBgColor = () => {
    if (usagePercentage >= 90) return 'bg-red-500';
    if (usagePercentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={getContrastClass(
      "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4",
      "min-h-screen bg-black p-4"
    )}>
      <div className={getContrastClass(
        "max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20",
        "max-w-4xl mx-auto bg-gray-900 rounded-3xl p-8 shadow-xl border-2 border-yellow-400"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield size={32} className={getContrastClass("text-blue-600", "text-yellow-400")} />
            <div>
              <h1 className={getContrastClass(
                "text-2xl font-bold text-gray-900",
                "text-2xl font-bold text-yellow-400"
              )}>
                11Mercado Admin Monitor
              </h1>
              <p className={getContrastClass("text-gray-600", "text-yellow-200")}>
                Real-time user session monitoring
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? getContrastClass('bg-green-500 hover:bg-green-600 text-white', 'bg-green-600 hover:bg-green-700 text-white')
                  : getContrastClass('bg-gray-500 hover:bg-gray-600 text-white', 'bg-gray-700 hover:bg-gray-600 text-yellow-400')
              }`}
            >
              <Eye size={16} className="inline mr-2" />
              {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
            </button>
            
            <button
              onClick={updateStats}
              className={getContrastClass(
                "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors",
                "bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg transition-colors"
              )}
            >
              <RefreshCw size={16} className="inline mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Users */}
          <div className={getContrastClass(
            "bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200",
            "bg-gray-800 rounded-2xl p-6 border border-yellow-400"
          )}>
            <div className="flex items-center justify-between mb-4">
              <Users size={24} className={getContrastClass("text-blue-600", "text-yellow-400")} />
              <span className={getContrastClass("text-blue-600 text-sm font-medium", "text-yellow-400 text-sm font-medium")}>
                Current Users
              </span>
            </div>
            <div className={`text-3xl font-bold ${getUsageColor()}`}>
              {currentUsers}
            </div>
            <div className={getContrastClass("text-blue-700 text-sm", "text-yellow-300 text-sm")}>
              Active sessions
            </div>
          </div>

          {/* Usage Percentage */}
          <div className={getContrastClass(
            "bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200",
            "bg-gray-800 rounded-2xl p-6 border border-yellow-400"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500"></div>
              <span className={getContrastClass("text-green-600 text-sm font-medium", "text-yellow-400 text-sm font-medium")}>
                Usage
              </span>
            </div>
            <div className={`text-3xl font-bold ${getUsageColor()}`}>
              {usagePercentage.toFixed(1)}%
            </div>
            <div className={getContrastClass("text-green-700 text-sm", "text-yellow-300 text-sm")}>
              of capacity
            </div>
          </div>

          {/* Max Capacity */}
          <div className={getContrastClass(
            "bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200",
            "bg-gray-800 rounded-2xl p-6 border border-yellow-400"
          )}>
            <div className="flex items-center justify-between mb-4">
              <Shield size={24} className={getContrastClass("text-purple-600", "text-yellow-400")} />
              <span className={getContrastClass("text-purple-600 text-sm font-medium", "text-yellow-400 text-sm font-medium")}>
                Max Capacity
              </span>
            </div>
            <div className={getContrastClass("text-3xl font-bold text-purple-700", "text-3xl font-bold text-yellow-300")}>
              {maxUsers}
            </div>
            <div className={getContrastClass("text-purple-700 text-sm", "text-yellow-300 text-sm")}>
              users allowed
            </div>
          </div>
        </div>

        {/* Usage Bar */}
        <div className={getContrastClass(
          "bg-white rounded-2xl p-6 border border-gray-200 mb-6",
          "bg-gray-800 rounded-2xl p-6 border border-yellow-400 mb-6"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={getContrastClass("text-lg font-semibold text-gray-900", "text-lg font-semibold text-yellow-400")}>
              Capacity Usage
            </h3>
            <span className={getContrastClass("text-gray-600", "text-yellow-300")}>
              {currentUsers} / {maxUsers} users
            </span>
          </div>
          
          <div className={getContrastClass("bg-gray-200 rounded-full h-4", "bg-gray-700 rounded-full h-4")}>
            <div 
              className={`${getUsageBgColor()} h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
              style={{ width: `${Math.max(usagePercentage, 0)}%` }}
            >
              {usagePercentage > 10 && (
                <span className="text-white text-xs font-medium">
                  {usagePercentage.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Status */}
          <div className={getContrastClass(
            "bg-white rounded-2xl p-6 border border-gray-200",
            "bg-gray-800 rounded-2xl p-6 border border-yellow-400"
          )}>
            <h3 className={getContrastClass("text-lg font-semibold text-gray-900 mb-4", "text-lg font-semibold text-yellow-400 mb-4")}>
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={getContrastClass("text-gray-600", "text-yellow-200")}>Session Timeout</span>
                <span className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-300")}>30 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={getContrastClass("text-gray-600", "text-yellow-200")}>Cleanup Interval</span>
                <span className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-300")}>5 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={getContrastClass("text-gray-600", "text-yellow-200")}>Auto Refresh</span>
                <span className={`font-medium ${autoRefresh ? 'text-green-500' : 'text-red-500'}`}>
                  {autoRefresh ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Last Update */}
          <div className={getContrastClass(
            "bg-white rounded-2xl p-6 border border-gray-200",
            "bg-gray-800 rounded-2xl p-6 border border-yellow-400"
          )}>
            <h3 className={getContrastClass("text-lg font-semibold text-gray-900 mb-4", "text-lg font-semibold text-yellow-400 mb-4")}>
              Last Update
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className={getContrastClass("text-gray-400", "text-yellow-400")} />
                <span className={getContrastClass("text-gray-600", "text-yellow-200")}>
                  {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
              <div className={getContrastClass("text-sm text-gray-500", "text-sm text-yellow-300")}>
                {lastUpdate.toLocaleDateString()}
              </div>
              {autoRefresh && (
                <div className={getContrastClass("text-xs text-green-600", "text-xs text-green-400")}>
                  ● Updates every 5 seconds
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Warning Messages */}
        {usagePercentage >= 90 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-700 font-medium">High Usage Warning</span>
            </div>
            <p className="text-red-600 text-sm mt-1">
              System is at {usagePercentage.toFixed(1)}% capacity. New users may be denied access.
            </p>
          </div>
        )}

        {usagePercentage >= 70 && usagePercentage < 90 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-700 font-medium">Moderate Usage</span>
            </div>
            <p className="text-yellow-600 text-sm mt-1">
              System is at {usagePercentage.toFixed(1)}% capacity. Monitor for potential access issues.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}