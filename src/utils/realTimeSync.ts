// Real-time synchronization system for 11Mercado
// Prevents cache/cookie conflicts and provides live updates

interface SyncEvent {
  type: 'SESSION_UPDATE' | 'USER_COUNT_UPDATE' | 'DONATION_UPDATE' | 'SYSTEM_UPDATE';
  data: any;
  timestamp: number;
  sessionId?: string;
}

interface SyncState {
  lastSync: number;
  userCount: number;
  activeSessions: string[];
  systemVersion: string;
  donationData: any;
}

class RealTimeSync {
  private static instance: RealTimeSync;
  private eventChannel: BroadcastChannel | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private sessionId: string | null = null;
  private lastSync: number = 0;
  private readonly SYNC_INTERVAL = 10000; // 10 seconds
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly VERSION = '2.0.0';
  private listeners: { [key: string]: Array<(data: any) => void> } = {};

  private constructor() {
    this.initialize();
  }

  public static getInstance(): RealTimeSync {
    if (!RealTimeSync.instance) {
      RealTimeSync.instance = new RealTimeSync();
    }
    return RealTimeSync.instance;
  }

  private initialize() {
    try {
      // Initialize BroadcastChannel for cross-tab communication
      this.eventChannel = new BroadcastChannel('11mercado-sync');
      this.eventChannel.addEventListener('message', this.handleSyncMessage.bind(this));
      
      // Generate session ID
      this.sessionId = this.generateSessionId();
      
      // Start sync intervals
      this.startSync();
      this.startHeartbeat();
      
      // Listen for storage changes (fallback for older browsers)
      window.addEventListener('storage', this.handleStorageChange.bind(this));
      
      // Listen for visibility changes to handle tab switching
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      
      // Listen for beforeunload to clean up
      window.addEventListener('beforeunload', this.cleanup.bind(this));
      
      console.log('🔄 RealTimeSync initialized with session:', this.sessionId);
    } catch (error) {
      console.warn('BroadcastChannel not supported, using localStorage fallback:', error);
      this.initializeFallback();
    }
  }

  private initializeFallback() {
    // For browsers that don't support BroadcastChannel
    this.sessionId = this.generateSessionId();
    this.startSync();
    this.startHeartbeat();
    
    // Use storage events for cross-tab communication
    window.addEventListener('storage', (event) => {
      if (event.key === '11mercado-sync-event') {
        try {
          const syncEvent: SyncEvent = JSON.parse(event.newValue || '{}');
          this.processSyncEvent(syncEvent);
        } catch (error) {
          console.warn('Failed to parse sync event:', error);
        }
      }
    });
  }

  private generateSessionId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startSync() {
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.SYNC_INTERVAL);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.HEARTBEAT_INTERVAL);
  }

  private handleSyncMessage(event: MessageEvent) {
    const syncEvent: SyncEvent = event.data;
    if (syncEvent.sessionId !== this.sessionId) {
      this.processSyncEvent(syncEvent);
    }
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === '11mercado-sync-state') {
      this.performSync();
    }
  }

  private handleVisibilityChange() {
    if (!document.hidden) {
      // Tab became visible, force sync
      this.performSync();
    }
  }

  private processSyncEvent(event: SyncEvent) {
    const { type, data, timestamp } = event;
    
    // Ignore old events
    if (timestamp < this.lastSync) return;
    
    switch (type) {
      case 'SESSION_UPDATE':
        this.handleSessionUpdate(data);
        break;
      case 'USER_COUNT_UPDATE':
        this.handleUserCountUpdate(data);
        break;
      case 'DONATION_UPDATE':
        this.handleDonationUpdate(data);
        break;
      case 'SYSTEM_UPDATE':
        this.handleSystemUpdate(data);
        break;
    }
    
    this.lastSync = timestamp;
  }

  private handleSessionUpdate(data: any) {
    // Update session data
    const currentUser = localStorage.getItem('11mercado_user');
    if (currentUser && data.forceLogout) {
      this.emit('session_expired', data);
    }
    
    this.emit('session_update', data);
  }

  private handleUserCountUpdate(data: any) {
    // Update user count display
    this.emit('user_count_update', data);
  }

  private handleDonationUpdate(data: any) {
    // Update donation data
    this.emit('donation_update', data);
  }

  private handleSystemUpdate(data: any) {
    // Handle system updates (like new version)
    if (data.version !== this.VERSION) {
      this.emit('system_update', {
        message: 'System has been updated. Please refresh to get the latest version.',
        version: data.version,
        requiresRefresh: true
      });
    }
  }

  private performSync() {
    try {
      const currentState = this.getCurrentState();
      const storedState = this.getStoredState();
      
      if (this.hasStateChanged(currentState, storedState)) {
        this.updateStoredState(currentState);
        this.broadcastUpdate('SYSTEM_UPDATE', { ...currentState, sessionId: this.sessionId });
      }
    } catch (error) {
      console.warn('Sync error:', error);
    }
  }

  private sendHeartbeat() {
    const heartbeatData = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      isActive: !document.hidden
    };
    
    this.broadcastUpdate('SESSION_UPDATE', heartbeatData);
  }

  private getCurrentState(): SyncState {
    const userSessionManager = require('./adminSessionManager').default;
    const sessionManager = userSessionManager.getInstance();
    
    return {
      lastSync: Date.now(),
      userCount: sessionManager.getCurrentUserCount(),
      activeSessions: Array.from(sessionManager.sessions?.keys() || []),
      systemVersion: this.VERSION,
      donationData: this.getDonationData()
    };
  }

  private getStoredState(): SyncState | null {
    try {
      const stored = localStorage.getItem('11mercado-sync-state');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  private hasStateChanged(current: SyncState, stored: SyncState | null): boolean {
    if (!stored) return true;
    
    return (
      current.userCount !== stored.userCount ||
      current.systemVersion !== stored.systemVersion ||
      JSON.stringify(current.donationData) !== JSON.stringify(stored.donationData)
    );
  }

  private updateStoredState(state: SyncState) {
    localStorage.setItem('11mercado-sync-state', JSON.stringify(state));
  }

  private getDonationData(): any {
    try {
      return {
        drives: JSON.parse(localStorage.getItem('donationDrives') || '[]'),
        lastUpdate: localStorage.getItem('donationLastUpdate')
      };
    } catch (error) {
      return { drives: [], lastUpdate: null };
    }
  }

  private broadcastUpdate(type: SyncEvent['type'], data: any) {
    const event: SyncEvent = {
      type,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    try {
      if (this.eventChannel) {
        this.eventChannel.postMessage(event);
      } else {
        // Fallback to localStorage for cross-tab communication
        localStorage.setItem('11mercado-sync-event', JSON.stringify(event));
        setTimeout(() => {
          localStorage.removeItem('11mercado-sync-event');
        }, 1000);
      }
    } catch (error) {
      console.warn('Failed to broadcast update:', error);
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: string, callback: (data: any) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.warn('Error in sync callback:', error);
        }
      });
    }
  }

  public forceSync() {
    this.performSync();
  }

  public getUserCount(): number {
    const state = this.getCurrentState();
    return state.userCount;
  }

  public updateUserCount(count: number) {
    this.broadcastUpdate('USER_COUNT_UPDATE', { count, timestamp: Date.now() });
  }

  public updateDonationData(data: any) {
    this.broadcastUpdate('DONATION_UPDATE', data);
  }

  public notifySystemUpdate() {
    this.broadcastUpdate('SYSTEM_UPDATE', {
      version: this.VERSION,
      message: 'System updated successfully!',
      timestamp: Date.now()
    });
  }

  private cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.eventChannel) {
      this.eventChannel.close();
    }
  }

  public destroy() {
    this.cleanup();
    RealTimeSync.instance = undefined as any;
  }
}

// React hook for components
export const useRealTimeSync = () => {
  const syncManager = RealTimeSync.getInstance();
  
  return {
    onSessionUpdate: (callback: (data: any) => void) => syncManager.on('session_update', callback),
    onUserCountUpdate: (callback: (data: any) => void) => syncManager.on('user_count_update', callback),
    onDonationUpdate: (callback: (data: any) => void) => syncManager.on('donation_update', callback),
    onSystemUpdate: (callback: (data: any) => void) => syncManager.on('system_update', callback),
    forceSync: () => syncManager.forceSync(),
    getUserCount: () => syncManager.getUserCount(),
    updateUserCount: (count: number) => syncManager.updateUserCount(count),
    updateDonationData: (data: any) => syncManager.updateDonationData(data),
    notifySystemUpdate: () => syncManager.notifySystemUpdate()
  };
};

export default RealTimeSync;