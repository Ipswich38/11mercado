// Enhanced Session Manager with Admin Monitoring
interface UserSession {
  sessionId: string;
  timestamp: number;
  lastActivity: number;
  userId: string;
  firstName: string;
  userType: 'student' | 'admin';
  ipAddress: string;
  userAgent: string;
  location?: string;
  activities: ActivityLog[];
}

interface ActivityLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  component: string;
  success: boolean;
  errorMessage?: string;
}

interface ErrorLog {
  id: string;
  timestamp: number;
  userId: string;
  sessionId: string;
  errorType: string;
  errorMessage: string;
  componentPath: string;
  stackTrace?: string;
  userAgent: string;
  ipAddress: string;
  resolved: boolean;
}

class AdminSessionManager {
  private static instance: AdminSessionManager;
  private sessions: Map<string, UserSession> = new Map();
  private errorLogs: ErrorLog[] = [];
  private readonly MAX_USERS = 80;
  private readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private cleanupTimer?: NodeJS.Timeout;

  private constructor() {
    try {
      this.startCleanupTimer();
      this.loadDataFromStorage();
    } catch (error) {
      console.error('Error initializing AdminSessionManager:', error);
      // Continue without error to prevent app crash
    }
  }

  public static getInstance(): AdminSessionManager {
    if (!AdminSessionManager.instance) {
      AdminSessionManager.instance = new AdminSessionManager();
    }
    return AdminSessionManager.instance;
  }

  private async getUserIP(): Promise<string> {
    try {
      // Try to get IP from multiple sources
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'Unknown';
    } catch (error) {
      try {
        // Fallback to another service
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data.ip || 'Unknown';
      } catch (fallbackError) {
        return 'Unknown';
      }
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private loadDataFromStorage(): void {
    try {
      // Load sessions
      const storedSessions = localStorage.getItem('11mercado_admin_sessions');
      if (storedSessions) {
        const sessionData = JSON.parse(storedSessions);
        const now = Date.now();
        
        Object.entries(sessionData).forEach(([sessionId, session]: [string, any]) => {
          if (now - session.lastActivity < this.SESSION_TIMEOUT) {
            this.sessions.set(sessionId, {
              ...session,
              activities: session.activities || []
            });
          }
        });
      }

      // Load error logs
      const storedErrors = localStorage.getItem('11mercado_error_logs');
      if (storedErrors) {
        this.errorLogs = JSON.parse(storedErrors);
      }
    } catch (error) {
      console.warn('Failed to load admin data from storage:', error);
    }
  }

  private saveDataToStorage(): void {
    try {
      // Save sessions
      const sessionData: { [key: string]: UserSession } = {};
      this.sessions.forEach((session, sessionId) => {
        sessionData[sessionId] = session;
      });
      localStorage.setItem('11mercado_admin_sessions', JSON.stringify(sessionData));

      // Save error logs
      localStorage.setItem('11mercado_error_logs', JSON.stringify(this.errorLogs));
    } catch (error) {
      console.warn('Failed to save admin data to storage:', error);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.CLEANUP_INTERVAL);
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    });

    expiredSessions.forEach(sessionId => {
      this.sessions.delete(sessionId);
    });

    if (expiredSessions.length > 0) {
      this.saveDataToStorage();
    }
  }

  public async requestAccess(userInfo: any): Promise<{ success: boolean; sessionId?: string; message: string; currentUsers: number; maxUsers: number }> {
    this.cleanupExpiredSessions();
    
    const currentUsers = this.sessions.size;
    
    // Admin always gets access
    if (userInfo.isAdmin || currentUsers < this.MAX_USERS) {
      const sessionId = this.generateSessionId();
      const now = Date.now();
      const ipAddress = await this.getUserIP();
      
      const session: UserSession = {
        sessionId,
        timestamp: now,
        lastActivity: now,
        userId: userInfo.firstName + '_' + Date.now(),
        firstName: userInfo.firstName,
        userType: userInfo.userType,
        ipAddress,
        userAgent: navigator.userAgent,
        activities: []
      };

      this.sessions.set(sessionId, session);
      this.logActivity(sessionId, 'LOGIN', `User ${userInfo.firstName} logged in`, 'Authentication', true);
      this.saveDataToStorage();

      return {
        success: true,
        sessionId,
        message: userInfo.isAdmin 
          ? `Admin access granted. Welcome ${userInfo.firstName}!`
          : `Access granted. You are user ${currentUsers + 1} of ${this.MAX_USERS}.`,
        currentUsers: currentUsers + 1,
        maxUsers: this.MAX_USERS
      };
    }

    return {
      success: false,
      message: `Access denied. Maximum ${this.MAX_USERS} users allowed. Currently ${currentUsers} users online. Please try again later.`,
      currentUsers,
      maxUsers: this.MAX_USERS
    };
  }

  public updateActivity(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      this.saveDataToStorage();
      return true;
    }
    return false;
  }

  public logActivity(sessionId: string, action: string, details: string, component: string, success: boolean, errorMessage?: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      const activity: ActivityLog = {
        id: this.generateLogId(),
        timestamp: Date.now(),
        action,
        details,
        component,
        success,
        errorMessage
      };
      
      session.activities.push(activity);
      
      // Keep only last 100 activities per session
      if (session.activities.length > 100) {
        session.activities = session.activities.slice(-100);
      }
      
      this.saveDataToStorage();
    }
  }

  public logError(sessionId: string, errorType: string, errorMessage: string, componentPath: string, stackTrace?: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      const errorLog: ErrorLog = {
        id: this.generateLogId(),
        timestamp: Date.now(),
        userId: session.userId,
        sessionId,
        errorType,
        errorMessage,
        componentPath,
        stackTrace,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        resolved: false
      };
      
      this.errorLogs.push(errorLog);
      
      // Keep only last 500 error logs
      if (this.errorLogs.length > 500) {
        this.errorLogs = this.errorLogs.slice(-500);
      }
      
      this.logActivity(sessionId, 'ERROR', errorMessage, componentPath, false, errorMessage);
      this.saveDataToStorage();
    }
  }

  public resolveError(errorId: string): void {
    const error = this.errorLogs.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      this.saveDataToStorage();
    }
  }

  public releaseSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.logActivity(sessionId, 'LOGOUT', `User ${session.firstName} logged out`, 'Authentication', true);
    }
    
    if (this.sessions.delete(sessionId)) {
      this.saveDataToStorage();
    }
  }

  // Admin-only methods
  public getAdminStats(): any {
    const now = Date.now();
    const sessions = Array.from(this.sessions.values());
    
    return {
      totalUsers: sessions.length,
      maxUsers: this.MAX_USERS,
      activeStudents: sessions.filter(s => s.userType === 'student').length,
      activeAdmins: sessions.filter(s => s.userType === 'admin').length,
      totalErrors: this.errorLogs.length,
      unresolvedErrors: this.errorLogs.filter(e => !e.resolved).length,
      sessionsToday: sessions.filter(s => now - s.timestamp < 24 * 60 * 60 * 1000).length,
      avgSessionDuration: this.calculateAvgSessionDuration(sessions),
      topErrors: this.getTopErrors(),
      recentActivities: this.getRecentActivities(20)
    };
  }

  public getAllSessions(): UserSession[] {
    return Array.from(this.sessions.values());
  }

  public getAllErrors(): ErrorLog[] {
    return this.errorLogs.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getSessionDetails(sessionId: string): UserSession | undefined {
    return this.sessions.get(sessionId);
  }

  private calculateAvgSessionDuration(sessions: UserSession[]): number {
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => {
      return sum + (session.lastActivity - session.timestamp);
    }, 0);
    
    return Math.round(totalDuration / sessions.length / 1000 / 60); // minutes
  }

  private getTopErrors(): { type: string; count: number }[] {
    const errorCounts: { [key: string]: number } = {};
    
    this.errorLogs.forEach(error => {
      errorCounts[error.errorType] = (errorCounts[error.errorType] || 0) + 1;
    });
    
    return Object.entries(errorCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getRecentActivities(limit: number): ActivityLog[] {
    const allActivities: (ActivityLog & { sessionId: string; userName: string })[] = [];
    
    this.sessions.forEach((session, sessionId) => {
      session.activities.forEach(activity => {
        allActivities.push({
          ...activity,
          sessionId,
          userName: session.firstName
        });
      });
    });
    
    return allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  public getCurrentUserCount(): number {
    this.cleanupExpiredSessions();
    return this.sessions.size;
  }

  public getMaxUsers(): number {
    return this.MAX_USERS;
  }

  public isSessionValid(sessionId: string): boolean {
    this.cleanupExpiredSessions();
    return this.sessions.has(sessionId);
  }

  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

export default AdminSessionManager;

// Hook for React components
export const useAdminSession = () => {
  try {
    const sessionManager = AdminSessionManager.getInstance();
    
    return {
      requestAccess: (userInfo: any) => {
        try {
          return sessionManager.requestAccess(userInfo);
        } catch (e) {
          console.error('Error in requestAccess:', e);
          return null;
        }
      },
      updateActivity: (sessionId: string) => {
        try {
          return sessionManager.updateActivity(sessionId);
        } catch (e) {
          console.error('Error in updateActivity:', e);
        }
      },
      releaseSession: (sessionId: string) => {
        try {
          return sessionManager.releaseSession(sessionId);
        } catch (e) {
          console.error('Error in releaseSession:', e);
        }
      },
      logActivity: (sessionId: string, action: string, details: string, component: string, success: boolean, errorMessage?: string) => {
        try {
          return sessionManager.logActivity(sessionId, action, details, component, success, errorMessage);
        } catch (e) {
          console.error('Error in logActivity:', e);
        }
      },
      logError: (sessionId: string, errorType: string, errorMessage: string, componentPath: string, stackTrace?: string) => {
        try {
          return sessionManager.logError(sessionId, errorType, errorMessage, componentPath, stackTrace);
        } catch (e) {
          console.error('Error in logError:', e);
        }
      },
      resolveError: (errorId: string) => {
        try {
          return sessionManager.resolveError(errorId);
        } catch (e) {
          console.error('Error in resolveError:', e);
        }
      },
      getCurrentUserCount: () => {
        try {
          return sessionManager.getCurrentUserCount();
        } catch (e) {
          console.error('Error in getCurrentUserCount:', e);
          return 0;
        }
      },
      getMaxUsers: () => {
        try {
          return sessionManager.getMaxUsers();
        } catch (e) {
          console.error('Error in getMaxUsers:', e);
          return 80;
        }
      },
      isSessionValid: (sessionId: string) => {
        try {
          return sessionManager.isSessionValid(sessionId);
        } catch (e) {
          console.error('Error in isSessionValid:', e);
          return false;
        }
      },
      // Admin methods
      getAdminStats: () => {
        try {
          return sessionManager.getAdminStats();
        } catch (e) {
          console.error('Error in getAdminStats:', e);
          return { activeSessions: 0, totalSessions: 0, errorCount: 0, sessionsToday: 0, avgSessionDuration: 0, topErrors: [], recentActivities: [] };
        }
      },
      getAllSessions: () => {
        try {
          return sessionManager.getAllSessions();
        } catch (e) {
          console.error('Error in getAllSessions:', e);
          return [];
        }
      },
      getAllErrors: () => {
        try {
          return sessionManager.getAllErrors();
        } catch (e) {
          console.error('Error in getAllErrors:', e);
          return [];
        }
      },
      getSessionDetails: (sessionId: string) => {
        try {
          return sessionManager.getSessionDetails(sessionId);
        } catch (e) {
          console.error('Error in getSessionDetails:', e);
          return undefined;
        }
      }
    };
  } catch (error) {
    console.error('Error initializing useAdminSession hook:', error);
    // Return fallback methods to prevent app crash
    return {
      requestAccess: () => null,
      updateActivity: () => {},
      releaseSession: () => {},
      logActivity: () => {},
      logError: () => {},
      resolveError: () => {},
      getCurrentUserCount: () => 0,
      getMaxUsers: () => 80,
      isSessionValid: () => false,
      getAdminStats: () => ({ activeSessions: 0, totalSessions: 0, errorCount: 0, sessionsToday: 0, avgSessionDuration: 0, topErrors: [], recentActivities: [] }),
      getAllSessions: () => [],
      getAllErrors: () => [],
      getSessionDetails: () => undefined
    };
  }
};