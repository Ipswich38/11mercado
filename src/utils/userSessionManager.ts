// User Session Manager for 11Mercado
// Implements an 80 concurrent user limit

interface UserSession {
  sessionId: string;
  timestamp: number;
  lastActivity: number;
}

class UserSessionManager {
  private static instance: UserSessionManager;
  private sessions: Map<string, UserSession> = new Map();
  private readonly MAX_USERS = 80;
  private readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private cleanupTimer?: NodeJS.Timeout;

  private constructor() {
    this.startCleanupTimer();
    this.loadSessionsFromStorage();
  }

  public static getInstance(): UserSessionManager {
    if (!UserSessionManager.instance) {
      UserSessionManager.instance = new UserSessionManager();
    }
    return UserSessionManager.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadSessionsFromStorage(): void {
    try {
      const stored = localStorage.getItem('11mercado_sessions');
      if (stored) {
        const sessionData = JSON.parse(stored);
        const now = Date.now();
        
        // Only load sessions that haven't expired
        Object.entries(sessionData).forEach(([sessionId, session]: [string, any]) => {
          if (now - session.lastActivity < this.SESSION_TIMEOUT) {
            this.sessions.set(sessionId, session);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load sessions from storage:', error);
    }
  }

  private saveSessionsToStorage(): void {
    try {
      const sessionData: { [key: string]: UserSession } = {};
      this.sessions.forEach((session, sessionId) => {
        sessionData[sessionId] = session;
      });
      localStorage.setItem('11mercado_sessions', JSON.stringify(sessionData));
    } catch (error) {
      console.warn('Failed to save sessions to storage:', error);
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
      this.saveSessionsToStorage();
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  public requestAccess(): { success: boolean; sessionId?: string; message: string; currentUsers: number; maxUsers: number } {
    this.cleanupExpiredSessions();
    
    const currentUsers = this.sessions.size;
    
    if (currentUsers >= this.MAX_USERS) {
      return {
        success: false,
        message: `Access denied. Maximum ${this.MAX_USERS} users allowed. Currently ${currentUsers} users online. Please try again later.`,
        currentUsers,
        maxUsers: this.MAX_USERS
      };
    }

    const sessionId = this.generateSessionId();
    const now = Date.now();
    
    const session: UserSession = {
      sessionId,
      timestamp: now,
      lastActivity: now
    };

    this.sessions.set(sessionId, session);
    this.saveSessionsToStorage();

    return {
      success: true,
      sessionId,
      message: `Access granted. You are user ${currentUsers + 1} of ${this.MAX_USERS}.`,
      currentUsers: currentUsers + 1,
      maxUsers: this.MAX_USERS
    };
  }

  public updateActivity(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      this.saveSessionsToStorage();
      return true;
    }
    return false;
  }

  public releaseSession(sessionId: string): void {
    if (this.sessions.delete(sessionId)) {
      this.saveSessionsToStorage();
      console.log(`Session ${sessionId} released`);
    }
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

export default UserSessionManager;

// Hook for React components
export const useUserSession = () => {
  const sessionManager = UserSessionManager.getInstance();
  
  return {
    requestAccess: () => sessionManager.requestAccess(),
    updateActivity: (sessionId: string) => sessionManager.updateActivity(sessionId),
    releaseSession: (sessionId: string) => sessionManager.releaseSession(sessionId),
    getCurrentUserCount: () => sessionManager.getCurrentUserCount(),
    getMaxUsers: () => sessionManager.getMaxUsers(),
    isSessionValid: (sessionId: string) => sessionManager.isSessionValid(sessionId)
  };
};