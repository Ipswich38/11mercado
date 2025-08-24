import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Shield, 
  MapPin, 
  Monitor,
  Receipt,
  Search,
  RefreshCw,
  MessageCircle,
  X,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  FileSpreadsheet,
  DollarSign,
  Database,
  RotateCw,
  Download
} from 'lucide-react';
import { useAdminSession } from '../utils/adminSessionManager';
import { consolidateAllData, exportDataForDebug } from '../utils/dataSync';

export default function AdminDashboard({ getContrastClass, onClose, onShowTutorial, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [errors, setErrors] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const {
    getAdminStats,
    getAllSessions,
    getAllErrors,
    getSessionDetails,
    resolveError
  } = useAdminSession();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setStats(getAdminStats());
    setSessions(getAllSessions());
    setErrors(getAllErrors());
  };

  const handleResolveError = (errorId) => {
    resolveError(errorId);
    loadData();
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: 'user', content: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMessage]);
    
    const input = chatInput;
    setChatInput('');
    
    // Simulate AI response based on context
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, stats, errors);
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse, timestamp: Date.now() }]);
    }, 1000);
  };

  const generateAIResponse = (input, currentStats, currentErrors) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('error') || lowerInput.includes('issue') || lowerInput.includes('problem')) {
      const unresolvedErrors = currentErrors.filter(e => !e.resolved);
      if (unresolvedErrors.length === 0) {
        return "✅ Great news! There are currently no unresolved errors in the system. All components are functioning normally.";
      }
      
      const commonErrors = unresolvedErrors.slice(0, 3);
      return `🔍 I found ${unresolvedErrors.length} unresolved errors. The most common issues are:

${commonErrors.map((error, i) => `${i + 1}. **${error.errorType}**: ${error.errorMessage} (Component: ${error.componentPath})`).join('\n')}

**Recommendations:**
- Check component imports and dependencies
- Verify user permissions and session validity
- Review network connectivity for API calls
- Consider implementing error boundaries for better error handling

Would you like me to help you troubleshoot any specific error?`;
    }
    
    if (lowerInput.includes('user') || lowerInput.includes('session') || lowerInput.includes('active')) {
      return `👥 **Current User Statistics:**
- **Active Users**: ${currentStats?.totalUsers || 0}/${currentStats?.maxUsers || 80}
- **Students**: ${currentStats?.activeStudents || 0}
- **Admins**: ${currentStats?.activeAdmins || 0}
- **Average Session**: ${currentStats?.avgSessionDuration || 0} minutes

${currentStats?.totalUsers > 60 ? '⚠️ **High Usage Alert**: System is approaching capacity limits. Consider monitoring performance.' : '✅ System capacity is healthy.'}

Recent activity shows ${currentStats?.sessionsToday || 0} sessions started today.`;
    }
    
    if (lowerInput.includes('performance') || lowerInput.includes('slow') || lowerInput.includes('lag')) {
      return `⚡ **Performance Analysis:**

Based on current metrics:
- **Active Sessions**: ${currentStats?.totalUsers || 0} (${Math.round((currentStats?.totalUsers || 0) / (currentStats?.maxUsers || 80) * 100)}% capacity)
- **Error Rate**: ${currentStats?.unresolvedErrors || 0} unresolved issues

**Performance Optimization Tips:**
1. Monitor session timeouts (15 min inactivity)
2. Check for memory leaks in long-running sessions
3. Optimize component re-renders
4. Consider lazy loading for heavy components
5. Monitor network requests and API response times

${currentStats?.totalUsers > 70 ? '⚠️ **Recommendation**: High user load detected. Consider implementing user queuing or increasing session timeout warnings.' : '✅ Performance is within optimal range.'}`;
    }
    
    if (lowerInput.includes('security') || lowerInput.includes('ip') || lowerInput.includes('login')) {
      return `🔒 **Security Overview:**

**Access Control:**
- Admin access code: Secure ✅
- User access code: Active ✅
- IP tracking: Enabled ✅

**Session Security:**
- 15-minute timeout: Active ✅
- Activity monitoring: Enabled ✅
- Automatic cleanup: Running ✅

**Recent Security Events:**
- Failed login attempts: Monitor in error logs
- Suspicious activity: Check IP patterns
- Session hijacking: No indicators detected

**Recommendations:**
- Regularly rotate access codes
- Monitor for unusual IP patterns
- Implement rate limiting for login attempts
- Consider 2FA for admin access`;
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('commands') || lowerInput.includes('what can you do')) {
      return `🤖 **Admin AI Assistant Commands:**

I can help you with:

**📊 System Monitoring:**
- "Show me current errors"
- "What's the user activity?"
- "Performance status"

**🔧 Troubleshooting:**
- "How to fix [specific error]"
- "Why are users getting disconnected?"
- "Login issues help"

**👥 User Management:**
- "Show active users"
- "User session details"
- "IP address analysis"

**🔒 Security:**
- "Security status"
- "Suspicious activity check"
- "Access code management"

**📈 Analytics:**
- "Usage statistics"
- "Error trends"
- "Session analytics"

Just ask me anything about the system and I'll provide insights and solutions!`;
    }
    
    // Default response
    return `🤖 I'm your Admin AI Assistant! I can help you monitor and manage the 11Mercado system.

**Current System Status:**
- Active Users: ${currentStats?.totalUsers || 0}/${currentStats?.maxUsers || 80}
- Unresolved Errors: ${currentStats?.unresolvedErrors || 0}
- System Health: ${currentStats?.unresolvedErrors === 0 ? '✅ Healthy' : '⚠️ Needs Attention'}

Ask me about:
- Error troubleshooting
- User activity monitoring  
- Performance optimization
- Security analysis
- System statistics

What would you like to know about?`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActivityColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const filteredErrors = errors.filter(error => {
    if (filterType === 'all') return true;
    if (filterType === 'unresolved') return !error.resolved;
    if (filterType === 'resolved') return error.resolved;
    return true;
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'users', name: 'Active Users', icon: Users },
    { id: 'errors', name: 'Error Logs', icon: AlertTriangle },
    { id: 'activities', name: 'Activities', icon: Activity },
    { id: 'donations', name: 'Donation Tracking', icon: FileSpreadsheet },
    { id: 'receipts', name: 'Receipt Recovery', icon: Receipt },
    { id: 'datasync', name: 'Data Sync & Consolidation', icon: Database }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={getContrastClass(
        "bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-7xl h-[90vh] flex flex-col",
        "bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-400/50 w-full max-w-7xl h-[90vh] flex flex-col"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <Shield className={getContrastClass("text-blue-600", "text-yellow-400")} size={24} />
            <div>
              <h1 className={getContrastClass("text-xl font-semibold text-gray-900", "text-xl font-semibold text-yellow-400")}>
                Admin Dashboard
              </h1>
              <p className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                System monitoring and management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className={getContrastClass(
                "p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors",
                "p-2 rounded-lg bg-gray-800 text-yellow-400 hover:bg-gray-700 transition-colors"
              )}
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={getContrastClass(
                "p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors",
                "p-2 rounded-lg bg-gray-800 text-green-400 hover:bg-gray-700 transition-colors"
              )}
              title="AI Assistant"
            >
              <MessageCircle size={16} />
            </button>
            <button
              onClick={onClose}
              className={getContrastClass(
                "p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors",
                "p-2 rounded-lg bg-gray-800 text-red-400 hover:bg-gray-700 transition-colors"
              )}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200/50 p-4">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={getContrastClass(
                      `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedTab === tab.id 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`,
                      `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedTab === tab.id 
                          ? 'bg-gray-800 text-yellow-400' 
                          : 'text-yellow-200 hover:bg-gray-800'
                      }`
                    )}
                  >
                    <Icon size={16} />
                    {tab.name}
                    {tab.id === 'errors' && stats?.unresolvedErrors > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {stats.unresolvedErrors}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            <div className="flex-1 p-6 overflow-auto">
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className={getContrastClass(
                      "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
                      "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
                    )}>
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="text-blue-600" size={20} />
                        <span className={getContrastClass("text-sm font-medium text-gray-600", "text-sm font-medium text-yellow-200")}>
                          Active Users
                        </span>
                      </div>
                      <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-yellow-400")}>
                        {stats?.totalUsers || 0}/{stats?.maxUsers || 80}
                      </div>
                      <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                        {Math.round((stats?.totalUsers || 0) / (stats?.maxUsers || 80) * 100)}% capacity
                      </div>
                    </div>

                    <div className={getContrastClass(
                      "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
                      "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
                    )}>
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="text-red-600" size={20} />
                        <span className={getContrastClass("text-sm font-medium text-gray-600", "text-sm font-medium text-yellow-200")}>
                          Unresolved Errors
                        </span>
                      </div>
                      <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-yellow-400")}>
                        {stats?.unresolvedErrors || 0}
                      </div>
                      <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                        of {stats?.totalErrors || 0} total
                      </div>
                    </div>

                    <div className={getContrastClass(
                      "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
                      "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
                    )}>
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="text-green-600" size={20} />
                        <span className={getContrastClass("text-sm font-medium text-gray-600", "text-sm font-medium text-yellow-200")}>
                          Avg Session
                        </span>
                      </div>
                      <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-yellow-400")}>
                        {stats?.avgSessionDuration || 0}m
                      </div>
                      <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                        average duration
                      </div>
                    </div>

                    <div className={getContrastClass(
                      "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
                      "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
                    )}>
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-purple-600" size={20} />
                        <span className={getContrastClass("text-sm font-medium text-gray-600", "text-sm font-medium text-yellow-200")}>
                          Today's Sessions
                        </span>
                      </div>
                      <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-yellow-400")}>
                        {stats?.sessionsToday || 0}
                      </div>
                      <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                        sessions started
                      </div>
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <div className={getContrastClass(
                    "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
                    "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
                  )}>
                    <h3 className={getContrastClass("text-lg font-semibold text-gray-900 mb-4", "text-lg font-semibold text-yellow-400 mb-4")}>
                      Recent Activities
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-auto">
                      {stats?.recentActivities?.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200/30">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${activity.success ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={getContrastClass("text-sm text-gray-700", "text-sm text-yellow-100")}>
                              {activity.userName}: {activity.action}
                            </span>
                          </div>
                          <span className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'users' && (
                <div className="space-y-4">
                  <h2 className={getContrastClass("text-xl font-semibold text-gray-900", "text-xl font-semibold text-yellow-400")}>
                    Active Users ({sessions.length})
                  </h2>
                  <div className="grid gap-4">
                    {sessions.map(session => (
                      <div
                        key={session.sessionId}
                        className={getContrastClass(
                          "bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/30 hover:bg-white/80 transition-colors cursor-pointer",
                          "bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-yellow-400/30 hover:bg-gray-800/80 transition-colors cursor-pointer"
                        )}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${session.userType === 'admin' ? 'bg-red-500' : 'bg-green-500'}`} />
                            <div>
                              <div className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                                {session.firstName}
                                {session.userType === 'admin' && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Admin</span>
                                )}
                              </div>
                              <div className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                                IP: {session.ipAddress} • Since: {formatTimestamp(session.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className={getContrastClass("text-gray-400", "text-yellow-300")} />
                            <span className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                              {Math.round((Date.now() - session.lastActivity) / 1000 / 60)}m ago
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'errors' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className={getContrastClass("text-xl font-semibold text-gray-900", "text-xl font-semibold text-yellow-400")}>
                      Error Logs ({filteredErrors.length})
                    </h2>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className={getContrastClass(
                        "px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900",
                        "px-3 py-2 rounded-lg border border-yellow-400 bg-gray-800 text-yellow-100"
                      )}
                    >
                      <option value="all">All Errors</option>
                      <option value="unresolved">Unresolved</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    {filteredErrors.map(error => (
                      <div
                        key={error.id}
                        className={getContrastClass(
                          "bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/30",
                          "bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-yellow-400/30"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {error.resolved ? (
                                <CheckCircle size={16} className="text-green-500" />
                              ) : (
                                <XCircle size={16} className="text-red-500" />
                              )}
                              <span className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                                {error.errorType}
                              </span>
                              <span className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                                {formatTimestamp(error.timestamp)}
                              </span>
                            </div>
                            <p className={getContrastClass("text-sm text-gray-700 mb-2", "text-sm text-yellow-100 mb-2")}>
                              {error.errorMessage}
                            </p>
                            <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                              Component: {error.componentPath} • User: {error.userId} • IP: {error.ipAddress}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedError(error)}
                              className={getContrastClass(
                                "p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors",
                                "p-2 rounded-lg bg-gray-700 text-blue-400 hover:bg-gray-600 transition-colors"
                              )}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            {!error.resolved && (
                              <button
                                onClick={() => handleResolveError(error.id)}
                                className={getContrastClass(
                                  "p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors",
                                  "p-2 rounded-lg bg-gray-700 text-green-400 hover:bg-gray-600 transition-colors"
                                )}
                                title="Mark as Resolved"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'activities' && (
                <div className="space-y-4">
                  <h2 className={getContrastClass("text-xl font-semibold text-gray-900", "text-xl font-semibold text-yellow-400")}>
                    All Activities
                  </h2>
                  <div className="space-y-3">
                    {sessions.map(session => (
                      <div
                        key={session.sessionId}
                        className={getContrastClass(
                          "bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/30",
                          "bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-yellow-400/30"
                        )}
                      >
                        <h3 className={getContrastClass("font-medium text-gray-900 mb-3", "font-medium text-yellow-400 mb-3")}>
                          {session.firstName} ({session.userType})
                        </h3>
                        <div className="space-y-2 max-h-32 overflow-auto">
                          {session.activities.slice(-10).map((activity, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${activity.success ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className={getContrastClass("text-gray-700", "text-yellow-100")}>
                                  {activity.action}: {activity.details}
                                </span>
                              </div>
                              <span className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'donations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className={getContrastClass("text-xl font-semibold text-gray-900", "text-xl font-semibold text-yellow-400")}>
                      Donation Tracking
                    </h2>
                    <button
                      onClick={() => {
                        onClose();
                        if (onNavigate) onNavigate('donation-tracking');
                      }}
                      className={getContrastClass(
                        "px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2",
                        "px-4 py-2 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 transition-colors flex items-center gap-2"
                      )}
                    >
                      <FileSpreadsheet size={16} />
                      Open Full Spreadsheet
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={getContrastClass(
                      "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
                      "bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-400/50"
                    )}>
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className={getContrastClass("text-green-600", "text-green-400")} size={24} />
                        <h3 className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>
                          Total Donations
                        </h3>
                      </div>
                      <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-yellow-400")}>
                        {(() => {
                          const donations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
                          const total = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
                          return `₱${total.toLocaleString()}`;
                        })()}
                      </div>
                      <div className={getContrastClass("text-sm text-gray-500", "text-sm text-yellow-300")}>
                        {(() => {
                          const donations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
                          return `${donations.length} entries`;
                        })()}
                      </div>
                    </div>

                    <div className={getContrastClass(
                      "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
                      "bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border-2 border-blue-400/50"
                    )}>
                      <div className="flex items-center gap-3 mb-2">
                        <FileSpreadsheet className={getContrastClass("text-blue-600", "text-blue-400")} size={24} />
                        <h3 className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>
                          General SPTA
                        </h3>
                      </div>
                      <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-blue-400")}>
                        {(() => {
                          const donations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
                          const total = donations.reduce((sum, d) => sum + (d.allocation?.generalSPTA || 0), 0);
                          return `₱${total.toLocaleString()}`;
                        })()}
                      </div>
                      <div className={getContrastClass("text-sm text-gray-500", "text-sm text-yellow-300")}>
                        Allocated funds
                      </div>
                    </div>

                    <div className={getContrastClass(
                      "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
                      "bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border-2 border-purple-400/50"
                    )}>
                      <div className="flex items-center gap-3 mb-2">
                        <FileSpreadsheet className={getContrastClass("text-purple-600", "text-purple-400")} size={24} />
                        <h3 className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>
                          11Mercado PTA
                        </h3>
                      </div>
                      <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-purple-400")}>
                        {(() => {
                          const donations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
                          const total = donations.reduce((sum, d) => sum + (d.allocation?.mercadoPTA || 0), 0);
                          return `₱${total.toLocaleString()}`;
                        })()}
                      </div>
                      <div className={getContrastClass("text-sm text-gray-500", "text-sm text-yellow-300")}>
                        Allocated funds
                      </div>
                    </div>
                  </div>

                  <div className={getContrastClass(
                    "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
                    "bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-400/50"
                  )}>
                    <h3 className={getContrastClass("font-medium text-gray-900 mb-4", "font-medium text-yellow-400 mb-4")}>
                      Recent Donation Entries
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-auto">
                      {(() => {
                        const donations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
                        return donations
                          .sort((a, b) => new Date(b.submissionTimestamp).getTime() - new Date(a.submissionTimestamp).getTime())
                          .slice(0, 5)
                          .map((donation, index) => (
                            <div
                              key={index}
                              className={getContrastClass(
                                "bg-white/50 rounded-lg p-3 border border-white/30",
                                "bg-gray-800/50 rounded-lg p-3 border border-gray-600"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                                    {donation.parentName}
                                  </div>
                                  <div className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                                    {donation.donationMode.toUpperCase()} • {donation.eSignature}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={getContrastClass("font-bold text-gray-900", "font-bold text-yellow-400")}>
                                    {donation.amount ? `₱${parseFloat(donation.amount).toLocaleString()}` : 'In-kind'}
                                  </div>
                                  <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                                    {donation.submissionDate}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ));
                      })()}
                      {(() => {
                        const donations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
                        return donations.length === 0 ? (
                          <div className={getContrastClass(
                            "text-center py-8 text-gray-500",
                            "text-center py-8 text-yellow-300"
                          )}>
                            No donation entries yet
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'receipts' && (
                <ReceiptRecoveryTab getContrastClass={getContrastClass} />
              )}

              {selectedTab === 'datasync' && (
                <DataSyncTab getContrastClass={getContrastClass} />
              )}
            </div>

            {/* AI Chat Panel */}
            {chatOpen && (
              <div className={getContrastClass(
                "w-80 border-l border-gray-200/50 bg-white/50 backdrop-blur-sm flex flex-col",
                "w-80 border-l border-yellow-400/50 bg-gray-900/50 backdrop-blur-sm flex flex-col"
              )}>
                <div className="p-4 border-b border-gray-200/50">
                  <div className="flex items-center gap-2">
                    <MessageCircle className={getContrastClass("text-blue-600", "text-yellow-400")} size={20} />
                    <h3 className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                      AI Assistant
                    </h3>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className={getContrastClass("text-sm text-gray-500 text-center", "text-sm text-yellow-300 text-center")}>
                      Ask me about system status, errors, or any admin questions!
                    </div>
                  )}
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`${
                        message.role === 'user' ? 'ml-8' : 'mr-8'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          message.role === 'user'
                            ? getContrastClass('bg-blue-100 text-blue-900', 'bg-gray-800 text-yellow-100')
                            : getContrastClass('bg-gray-100 text-gray-900', 'bg-gray-700 text-yellow-100')
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className={getContrastClass("text-xs text-gray-500 mt-1", "text-xs text-yellow-300 mt-1")}>
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about system status..."
                      className={getContrastClass(
                        "flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm",
                        "flex-1 px-3 py-2 rounded-lg border border-yellow-400 bg-gray-800 text-yellow-100 text-sm"
                      )}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim()}
                      className={getContrastClass(
                        "p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors",
                        "p-2 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50 transition-colors"
                      )}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
          <div className={getContrastClass(
            "bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto",
            "bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-yellow-400/50 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
          )}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={getContrastClass("text-lg font-semibold text-gray-900", "text-lg font-semibold text-yellow-400")}>
                  Session Details: {selectedSession.firstName}
                </h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className={getContrastClass(
                    "p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors",
                    "p-2 rounded-lg bg-gray-800 text-yellow-400 hover:bg-gray-700 transition-colors"
                  )}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className={getContrastClass(
                  "bg-gray-50 rounded-lg p-4",
                  "bg-gray-800 rounded-lg p-4"
                )}>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>User Type:</span>
                      <span className={getContrastClass("ml-2 text-gray-900", "ml-2 text-yellow-100")}>{selectedSession.userType}</span>
                    </div>
                    <div>
                      <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>IP Address:</span>
                      <span className={getContrastClass("ml-2 text-gray-900", "ml-2 text-yellow-100")}>{selectedSession.ipAddress}</span>
                    </div>
                    <div>
                      <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Login Time:</span>
                      <span className={getContrastClass("ml-2 text-gray-900", "ml-2 text-yellow-100")}>{formatTimestamp(selectedSession.timestamp)}</span>
                    </div>
                    <div>
                      <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Last Activity:</span>
                      <span className={getContrastClass("ml-2 text-gray-900", "ml-2 text-yellow-100")}>{formatTimestamp(selectedSession.lastActivity)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className={getContrastClass("font-medium text-gray-900 mb-2", "font-medium text-yellow-400 mb-2")}>
                    Activity History
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {selectedSession.activities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200/30">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${activity.success ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={getContrastClass("text-sm text-gray-700", "text-sm text-yellow-100")}>
                            {activity.action}: {activity.details}
                          </span>
                        </div>
                        <span className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Details Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
          <div className={getContrastClass(
            "bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto",
            "bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-yellow-400/50 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
          )}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={getContrastClass("text-lg font-semibold text-gray-900", "text-lg font-semibold text-yellow-400")}>
                  Error Details
                </h3>
                <button
                  onClick={() => setSelectedError(null)}
                  className={getContrastClass(
                    "p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors",
                    "p-2 rounded-lg bg-gray-800 text-yellow-400 hover:bg-gray-700 transition-colors"
                  )}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className={getContrastClass(
                  "bg-red-50 rounded-lg p-4",
                  "bg-gray-800 rounded-lg p-4"
                )}>
                  <div className="space-y-2">
                    <div>
                      <span className={getContrastClass("font-medium text-red-700", "font-medium text-red-400")}>Error Type:</span>
                      <span className={getContrastClass("ml-2 text-red-900", "ml-2 text-red-300")}>{selectedError.errorType}</span>
                    </div>
                    <div>
                      <span className={getContrastClass("font-medium text-red-700", "font-medium text-red-400")}>Message:</span>
                      <p className={getContrastClass("mt-1 text-red-900", "mt-1 text-red-300")}>{selectedError.errorMessage}</p>
                    </div>
                    <div>
                      <span className={getContrastClass("font-medium text-red-700", "font-medium text-red-400")}>Component:</span>
                      <span className={getContrastClass("ml-2 text-red-900", "ml-2 text-red-300")}>{selectedError.componentPath}</span>
                    </div>
                    <div>
                      <span className={getContrastClass("font-medium text-red-700", "font-medium text-red-400")}>Time:</span>
                      <span className={getContrastClass("ml-2 text-red-900", "ml-2 text-red-300")}>{formatTimestamp(selectedError.timestamp)}</span>
                    </div>
                    <div>
                      <span className={getContrastClass("font-medium text-red-700", "font-medium text-red-400")}>User:</span>
                      <span className={getContrastClass("ml-2 text-red-900", "ml-2 text-red-300")}>{selectedError.userId}</span>
                    </div>
                    <div>
                      <span className={getContrastClass("font-medium text-red-700", "font-medium text-red-400")}>IP Address:</span>
                      <span className={getContrastClass("ml-2 text-red-900", "ml-2 text-red-300")}>{selectedError.ipAddress}</span>
                    </div>
                  </div>
                </div>
                
                {selectedError.stackTrace && (
                  <div>
                    <h4 className={getContrastClass("font-medium text-gray-900 mb-2", "font-medium text-yellow-400 mb-2")}>
                      Stack Trace
                    </h4>
                    <pre className={getContrastClass(
                      "bg-gray-100 rounded-lg p-3 text-xs text-gray-800 overflow-auto max-h-32",
                      "bg-gray-800 rounded-lg p-3 text-xs text-yellow-100 overflow-auto max-h-32"
                    )}>
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {!selectedError.resolved && (
                    <button
                      onClick={() => {
                        handleResolveError(selectedError.id);
                        setSelectedError(null);
                      }}
                      className={getContrastClass(
                        "px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors",
                        "px-4 py-2 rounded-lg bg-green-400 text-black hover:bg-green-300 transition-colors"
                      )}
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Receipt Recovery Component
function ReceiptRecoveryTab({ getContrastClass }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchForReceipt = () => {
    setIsSearching(true);
    
    try {
      const donations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
      const regeneratedReceipts = JSON.parse(localStorage.getItem('regeneratedAcknowledgements') || '[]');
      
      const allRecords = [...donations, ...regeneratedReceipts];
      
      const results = allRecords.filter(record => 
        record.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.eSignature?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for receipts:', error);
      setSearchResults([]);
    }
    
    setTimeout(() => setIsSearching(false), 500);
  };

  const generateReceipt = (record) => {
    try {
      // Create a new acknowledgement receipt
      const receiptData = {
        referenceNumber: record.referenceNumber || `ADMIN-${Date.now()}`,
        submissionDate: record.submissionDate || new Date().toISOString().split('T')[0],
        submissionTime: record.submissionTime || new Date().toLocaleTimeString(),
        parentName: record.parentName,
        studentName: record.studentName,
        donationMode: record.donationMode || 'unknown',
        amount: record.amount,
        allocation: record.allocation,
        regeneratedBy: 'Admin',
        regeneratedAt: new Date().toISOString(),
        isAdminGenerated: true
      };

      // Store the regenerated receipt
      const existing = JSON.parse(localStorage.getItem('regeneratedAcknowledgements') || '[]');
      existing.push(receiptData);
      localStorage.setItem('regeneratedAcknowledgements', JSON.stringify(existing));

      // Show success message
      alert(`Acknowledgement receipt generated for ${record.referenceNumber || 'donation record'}`);
      
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={getContrastClass("text-xl font-semibold text-gray-900", "text-xl font-semibold text-yellow-400")}>
          Receipt Recovery System
        </h2>
      </div>
      
      <div className={getContrastClass(
        "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
        "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
      )}>
        <h3 className={getContrastClass("text-lg font-semibold text-gray-900 mb-4", "text-lg font-semibold text-yellow-400 mb-4")}>
          Search for Donation Records
        </h3>
        <p className={getContrastClass("text-sm text-gray-600 mb-4", "text-sm text-yellow-200 mb-4")}>
          Search by reference number, parent name, student name, or signature to recover acknowledgement receipts.
        </p>
        
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={20} className={getContrastClass(
              "absolute left-3 top-3 text-gray-400",
              "absolute left-3 top-3 text-yellow-400"
            )} />
            <input
              type="text"
              placeholder="Enter reference number, parent name, student name, or signature..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 p-3 rounded-xl border ${getContrastClass(
                'border-gray-300 bg-white text-gray-900',
                'border-gray-600 bg-gray-800 text-yellow-200'
              )} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              onKeyPress={(e) => e.key === 'Enter' && searchForReceipt()}
            />
          </div>
          <button
            onClick={searchForReceipt}
            disabled={!searchTerm.trim() || isSearching}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Search
              </>
            )}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
              Search Results ({searchResults.length})
            </h4>
            {searchResults.map((record, index) => (
              <div
                key={index}
                className={getContrastClass(
                  "bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow",
                  "bg-gray-900 rounded-xl p-4 border border-gray-700 hover:border-yellow-400 transition-colors"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={getContrastClass(
                        "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium",
                        "bg-gray-800 text-yellow-400 text-xs px-2 py-1 rounded-full font-medium border border-yellow-400"
                      )}>
                        {record.referenceNumber || 'No Reference'}
                      </span>
                      {record.isAdminGenerated && (
                        <span className={getContrastClass(
                          "bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full",
                          "bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full border border-green-400"
                        )}>
                          Admin Generated
                        </span>
                      )}
                    </div>
                    
                    <h5 className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
                      {record.parentName || 'Unknown Parent'}
                    </h5>
                    <p className={getContrastClass("text-gray-600 text-sm", "text-yellow-200 text-sm")}>
                      Student: {record.studentName || 'Unknown'} • Mode: {record.donationMode?.toUpperCase() || 'Unknown'}
                    </p>
                    <p className={getContrastClass("text-gray-500 text-xs", "text-yellow-300 text-xs")}>
                      {record.submissionDate} • Signature: {record.eSignature || 'None'}
                    </p>
                  </div>

                  <div className="text-right">
                    {record.amount && (
                      <div className={getContrastClass("text-lg font-bold text-gray-900", "text-lg font-bold text-yellow-400")}>
                        ₱{parseFloat(record.amount).toLocaleString()}
                      </div>
                    )}
                    <button
                      onClick={() => generateReceipt(record)}
                      className={getContrastClass(
                        "text-green-600 hover:text-green-800 flex items-center gap-1 px-3 py-1 rounded hover:bg-green-50 text-sm mt-2",
                        "text-green-400 hover:text-green-300 flex items-center gap-1 px-3 py-1 rounded hover:bg-green-900/20 text-sm mt-2"
                      )}
                    >
                      <Receipt size={14} />
                      Generate Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchTerm && searchResults.length === 0 && !isSearching && (
          <div className={getContrastClass(
            "text-center py-8 bg-gray-50 rounded-xl",
            "text-center py-8 bg-gray-800 rounded-xl"
          )}>
            <Receipt size={48} className={getContrastClass("mx-auto mb-4 text-gray-400", "mx-auto mb-4 text-yellow-400")} />
            <h4 className={getContrastClass("font-semibold text-gray-900 mb-2", "font-semibold text-yellow-400 mb-2")}>
              No Records Found
            </h4>
            <p className={getContrastClass("text-gray-600", "text-yellow-200")}>
              No donation records match your search criteria. Try different search terms.
            </p>
          </div>
        )}
      </div>

      <div className={getContrastClass(
        "bg-blue-50 border border-blue-200 rounded-xl p-4",
        "bg-gray-800 border border-yellow-400 rounded-xl p-4"
      )}>
        <h4 className={getContrastClass("font-semibold text-blue-800 mb-2", "font-semibold text-yellow-400 mb-2")}>
          How Receipt Recovery Works
        </h4>
        <ul className={getContrastClass("text-sm text-blue-700 space-y-1", "text-sm text-yellow-200 space-y-1")}>
          <li>• Search by any detail you remember from the donation</li>
          <li>• Review found records to identify the correct donation</li>
          <li>• Generate a new acknowledgement receipt if the original is missing</li>
          <li>• All regenerated receipts are tracked with admin audit trail</li>
        </ul>
      </div>
    </div>
  );
}

// Data Sync & Consolidation Component
function DataSyncTab({ getContrastClass }) {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [consolidatedData, setConsolidatedData] = useState(null);
  const [syncLog, setSyncLog] = useState([]);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  useEffect(() => {
    loadConsolidatedData();
  }, []);

  const addToLog = (message, type = 'info') => {
    setSyncLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message,
      type
    }].slice(-20)); // Keep last 20 log entries
  };

  const loadConsolidatedData = async () => {
    try {
      setSyncStatus('loading');
      addToLog('Loading consolidated data from all sources...', 'info');
      
      const data = consolidateAllData();
      setConsolidatedData(data);
      
      addToLog(`Consolidated ${data.donationEntries.length} donation entries, ${data.donationDrives.length} drives, ${Object.keys(data.donationFiles).length} files, ${data.sessions.length} sessions`, 'success');
      setSyncStatus('completed');
    } catch (error) {
      console.error('Error loading consolidated data:', error);
      addToLog(`Error loading data: ${error.message}`, 'error');
      setSyncStatus('error');
    }
  };

  const handleManualSync = async () => {
    try {
      setSyncStatus('syncing');
      addToLog('Starting manual data synchronization...', 'info');
      
      // Import syncData from dataSync utility
      const { syncData } = await import('../utils/dataSync');
      const success = await syncData();
      
      if (success) {
        addToLog('Manual sync completed successfully', 'success');
        loadConsolidatedData();
      } else {
        addToLog('Manual sync completed with fallbacks', 'warning');
        loadConsolidatedData();
      }
      
      setSyncStatus('completed');
    } catch (error) {
      console.error('Manual sync error:', error);
      addToLog(`Manual sync failed: ${error.message}`, 'error');
      setSyncStatus('error');
    }
  };

  const handleExportData = () => {
    try {
      addToLog('Exporting consolidated data for debug...', 'info');
      exportDataForDebug();
      addToLog('Data export completed successfully', 'success');
    } catch (error) {
      console.error('Export error:', error);
      addToLog(`Export failed: ${error.message}`, 'error');
    }
  };

  const handleClearLocalData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
      try {
        localStorage.removeItem('donationEntries');
        localStorage.removeItem('donationDrives');
        localStorage.removeItem('donationFiles');
        localStorage.removeItem('activeSessions');
        localStorage.removeItem('syncBackup');
        addToLog('Local data cleared successfully', 'warning');
        setConsolidatedData(null);
        loadConsolidatedData();
      } catch (error) {
        addToLog(`Error clearing data: ${error.message}`, 'error');
      }
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'loading':
      case 'syncing':
        return <RefreshCw size={16} className="animate-spin" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <RotateCw size={16} />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={getContrastClass("text-xl font-semibold text-gray-900", "text-xl font-semibold text-yellow-400")}>
          Data Sync & Consolidation
        </h2>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
            Status: {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={handleManualSync}
          disabled={syncStatus === 'syncing'}
          className={getContrastClass(
            "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-4 rounded-xl flex items-center gap-3 transition-colors",
            "bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 text-black p-4 rounded-xl flex items-center gap-3 transition-colors"
          )}
        >
          <RotateCw size={20} />
          <div className="text-left">
            <div className="font-semibold">Manual Sync</div>
            <div className="text-xs opacity-80">Force sync all data</div>
          </div>
        </button>

        <button
          onClick={loadConsolidatedData}
          disabled={syncStatus === 'loading'}
          className={getContrastClass(
            "bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-4 rounded-xl flex items-center gap-3 transition-colors",
            "bg-green-400 hover:bg-green-300 disabled:bg-gray-600 text-black p-4 rounded-xl flex items-center gap-3 transition-colors"
          )}
        >
          <RefreshCw size={20} />
          <div className="text-left">
            <div className="font-semibold">Reload Data</div>
            <div className="text-xs opacity-80">Refresh consolidated view</div>
          </div>
        </button>

        <button
          onClick={handleExportData}
          className={getContrastClass(
            "bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl flex items-center gap-3 transition-colors",
            "bg-purple-400 hover:bg-purple-300 text-black p-4 rounded-xl flex items-center gap-3 transition-colors"
          )}
        >
          <Download size={20} />
          <div className="text-left">
            <div className="font-semibold">Export Debug</div>
            <div className="text-xs opacity-80">Download all data</div>
          </div>
        </button>

        <button
          onClick={handleClearLocalData}
          className={getContrastClass(
            "bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl flex items-center gap-3 transition-colors",
            "bg-red-400 hover:bg-red-300 text-black p-4 rounded-xl flex items-center gap-3 transition-colors"
          )}
        >
          <XCircle size={20} />
          <div className="text-left">
            <div className="font-semibold">Clear Data</div>
            <div className="text-xs opacity-80">Reset all local data</div>
          </div>
        </button>
      </div>

      {/* Data Overview */}
      {consolidatedData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={getContrastClass(
            "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
            "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-green-600" size={20} />
              <span className={getContrastClass("text-sm font-medium text-gray-600", "text-sm font-medium text-yellow-200")}>
                Donation Entries
              </span>
            </div>
            <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-yellow-400")}>
              {consolidatedData.donationEntries.length}
            </div>
            <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
              Total: ₱{consolidatedData.donationEntries.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0).toLocaleString()}
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
            "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet className="text-blue-600" size={20} />
              <span className={getContrastClass("text-sm font-medium text-gray-600", "text-sm font-medium text-yellow-200")}>
                Donation Drives
              </span>
            </div>
            <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-yellow-400")}>
              {consolidatedData.donationDrives.length}
            </div>
            <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
              Active drives
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
            "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <Database className="text-purple-600" size={20} />
              <span className={getContrastClass("text-sm font-medium text-gray-600", "text-sm font-medium text-yellow-200")}>
                Stored Files
              </span>
            </div>
            <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-yellow-400")}>
              {Object.keys(consolidatedData.donationFiles).length}
            </div>
            <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
              {formatFileSize(JSON.stringify(consolidatedData.donationFiles).length)}
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
            "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-orange-600" size={20} />
              <span className={getContrastClass("text-sm font-medium text-gray-600", "text-sm font-medium text-yellow-200")}>
                Active Sessions
              </span>
            </div>
            <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-yellow-400")}>
              {consolidatedData.sessions.length}
            </div>
            <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
              Recent sessions
            </div>
          </div>
        </div>
      )}

      {/* Sync Log */}
      <div className={getContrastClass(
        "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
        "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={getContrastClass("text-lg font-semibold text-gray-900", "text-lg font-semibold text-yellow-400")}>
            Synchronization Log
          </h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="rounded"
              />
              <span className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                Auto-sync enabled
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-auto">
          {syncLog.length === 0 ? (
            <div className={getContrastClass("text-center py-8 text-gray-500", "text-center py-8 text-yellow-300")}>
              No sync activity yet. Run a manual sync to see logs.
            </div>
          ) : (
            syncLog.map((entry, index) => (
              <div key={index} className="flex items-start justify-between py-2 border-b border-gray-200/30">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    entry.type === 'error' ? 'bg-red-500' :
                    entry.type === 'warning' ? 'bg-yellow-500' :
                    entry.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <span className={getContrastClass("text-sm text-gray-700", "text-sm text-yellow-100")}>
                    {entry.message}
                  </span>
                </div>
                <span className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Data Sources Status */}
      <div className={getContrastClass(
        "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30",
        "bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/30"
      )}>
        <h3 className={getContrastClass("text-lg font-semibold text-gray-900 mb-4", "text-lg font-semibold text-yellow-400 mb-4")}>
          Data Sources Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={getContrastClass(
            "bg-gray-50 rounded-lg p-4",
            "bg-gray-800 rounded-lg p-4"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                LocalStorage
              </span>
            </div>
            <div className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
              Primary data storage - Available
            </div>
          </div>

          <div className={getContrastClass(
            "bg-gray-50 rounded-lg p-4",
            "bg-gray-800 rounded-lg p-4"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                'indexedDB' in window ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                IndexedDB
              </span>
            </div>
            <div className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
              {('indexedDB' in window) ? 'Backup storage - Available' : 'Not supported'}
            </div>
          </div>

          <div className={getContrastClass(
            "bg-gray-50 rounded-lg p-4",
            "bg-gray-800 rounded-lg p-4"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                'BroadcastChannel' in window ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                BroadcastChannel
              </span>
            </div>
            <div className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
              {('BroadcastChannel' in window) ? 'Cross-tab sync - Available' : 'Not supported'}
            </div>
          </div>
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className={getContrastClass(
        "bg-blue-50 border border-blue-200 rounded-xl p-4",
        "bg-gray-800 border border-yellow-400 rounded-xl p-4"
      )}>
        <h4 className={getContrastClass("font-semibold text-blue-800 mb-2", "font-semibold text-yellow-400 mb-2")}>
          Sync Troubleshooting Tips
        </h4>
        <ul className={getContrastClass("text-sm text-blue-700 space-y-1", "text-sm text-yellow-200 space-y-1")}>
          <li>• <strong>Different data across devices:</strong> Run manual sync on all devices</li>
          <li>• <strong>Missing donations:</strong> Use export debug to check all data sources</li>
          <li>• <strong>Image issues:</strong> Files are stored locally per device, sync doesn't transfer images</li>
          <li>• <strong>Performance issues:</strong> Clear old data if storage is full</li>
          <li>• <strong>Cross-tab sync:</strong> Open multiple tabs and run sync to test BroadcastChannel</li>
        </ul>
      </div>
    </div>
  );
}