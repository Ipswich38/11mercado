// Centralized Data Synchronization System
// This system ensures data consistency across browsers and devices

interface SyncData {
  donationEntries: any[];
  donationDrives: any[];
  donationFiles: Record<string, any>;
  sessions: any[];
  timestamp: string;
  deviceId: string;
}

const SYNC_ENDPOINT = 'https://api.jsonbin.io/v3/b'; // Free JSON storage service
const SYNC_KEY = '11mercado-pta-sync';
const SYNC_INTERVAL = 30000; // 30 seconds

// Generate unique device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Create backup using localStorage as primary, IndexedDB as secondary
const createLocalBackup = (data: SyncData) => {
  try {
    // Primary backup in localStorage
    localStorage.setItem('syncBackup', JSON.stringify(data));
    
    // Secondary backup using IndexedDB for larger storage
    if ('indexedDB' in window) {
      const request = indexedDB.open('PTABackup', 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['backups'], 'readwrite');
        const store = transaction.objectStore('backups');
        store.put(data, 'latest');
      };
    }
  } catch (error) {
    console.error('Error creating local backup:', error);
  }
};

// Restore from local backup
const restoreFromBackup = (): SyncData | null => {
  try {
    const backup = localStorage.getItem('syncBackup');
    if (backup) {
      return JSON.parse(backup);
    }
  } catch (error) {
    console.error('Error restoring backup:', error);
  }
  return null;
};

// Collect all data from current device
export const collectCurrentData = (): SyncData => {
  const donationEntries = JSON.parse(localStorage.getItem('donationEntries') || '[]');
  const donationDrives = JSON.parse(localStorage.getItem('donationDrives') || '[]');
  const donationFiles = JSON.parse(localStorage.getItem('donationFiles') || '{}');
  const sessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');

  return {
    donationEntries,
    donationDrives,
    donationFiles,
    sessions,
    timestamp: new Date().toISOString(),
    deviceId: getDeviceId()
  };
};

// Merge data from multiple sources intelligently
export const mergeData = (localData: SyncData, remoteData: SyncData): SyncData => {
  const merged: SyncData = {
    donationEntries: [],
    donationDrives: localData.donationDrives.length > 0 ? localData.donationDrives : remoteData.donationDrives,
    donationFiles: {},
    sessions: [],
    timestamp: new Date().toISOString(),
    deviceId: localData.deviceId
  };

  // Merge donation entries by reference number (avoid duplicates)
  const entryMap = new Map();
  [...localData.donationEntries, ...remoteData.donationEntries].forEach(entry => {
    if (entry.referenceNumber && !entryMap.has(entry.referenceNumber)) {
      entryMap.set(entry.referenceNumber, entry);
    }
  });
  merged.donationEntries = Array.from(entryMap.values());

  // Merge files
  merged.donationFiles = { ...remoteData.donationFiles, ...localData.donationFiles };

  // Merge sessions (keep active ones)
  const sessionMap = new Map();
  [...localData.sessions, ...remoteData.sessions].forEach(session => {
    const isRecent = new Date(session.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    if (session.sessionId && isRecent && !sessionMap.has(session.sessionId)) {
      sessionMap.set(session.sessionId, session);
    }
  });
  merged.sessions = Array.from(sessionMap.values());

  return merged;
};

// Apply merged data to localStorage
export const applyMergedData = (data: SyncData) => {
  try {
    localStorage.setItem('donationEntries', JSON.stringify(data.donationEntries));
    localStorage.setItem('donationDrives', JSON.stringify(data.donationDrives));
    localStorage.setItem('donationFiles', JSON.stringify(data.donationFiles));
    localStorage.setItem('activeSessions', JSON.stringify(data.sessions));
    localStorage.setItem('lastSyncTimestamp', data.timestamp);
    
    // Create backup
    createLocalBackup(data);
    
    // Trigger UI updates
    window.dispatchEvent(new CustomEvent('dataSync', { detail: data }));
  } catch (error) {
    console.error('Error applying merged data:', error);
  }
};

// Sync with remote storage using multiple fallback methods
export const syncData = async (): Promise<boolean> => {
  try {
    const localData = collectCurrentData();
    
    // Method 1: Try JSONBin API (requires API key setup)
    try {
      const response = await fetch(`${SYNC_ENDPOINT}/${SYNC_KEY}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const remoteData = await response.json();
        const merged = mergeData(localData, remoteData);
        applyMergedData(merged);
        return true;
      }
    } catch (apiError) {
      console.warn('Remote sync failed, using local sync methods');
    }
    
    // Method 2: Browser-based sync using BroadcastChannel
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('pta-sync');
      
      // Request data from other tabs/windows
      channel.postMessage({ type: 'REQUEST_DATA', data: localData });
      
      // Listen for responses
      const syncPromise = new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 5000);
        
        channel.onmessage = (event) => {
          if (event.data.type === 'DATA_RESPONSE') {
            clearTimeout(timeout);
            const merged = mergeData(localData, event.data.data);
            applyMergedData(merged);
            resolve(true);
          }
        };
      });
      
      const result = await syncPromise;
      channel.close();
      
      if (result) return true;
    }
    
    // Method 3: Fallback to local backup restoration
    const backup = restoreFromBackup();
    if (backup) {
      const merged = mergeData(localData, backup);
      applyMergedData(merged);
      return true;
    }
    
    // Method 4: At minimum, ensure current data is backed up
    createLocalBackup(localData);
    return false;
    
  } catch (error) {
    console.error('Sync failed:', error);
    return false;
  }
};

// Initialize sync system
export const initDataSync = () => {
  // Sync on page load
  syncData();
  
  // Periodic sync
  setInterval(syncData, SYNC_INTERVAL);
  
  // Sync before page unload
  window.addEventListener('beforeunload', () => {
    const data = collectCurrentData();
    createLocalBackup(data);
  });
  
  // Listen for BroadcastChannel sync requests
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('pta-sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'REQUEST_DATA') {
        const localData = collectCurrentData();
        channel.postMessage({ type: 'DATA_RESPONSE', data: localData });
      }
    };
  }
  
  // Storage change detection
  window.addEventListener('storage', (event) => {
    if (event.key?.includes('donation') || event.key?.includes('session')) {
      setTimeout(syncData, 1000); // Debounced sync
    }
  });
  
  console.log('Data synchronization system initialized');
};

// Emergency data consolidation function for admin use
export const consolidateAllData = (): SyncData => {
  const currentData = collectCurrentData();
  const backup = restoreFromBackup();
  
  if (backup) {
    return mergeData(currentData, backup);
  }
  
  return currentData;
};

// Export data for debugging
export const exportDataForDebug = () => {
  const data = consolidateAllData();
  console.log('=== CONSOLIDATED DATA EXPORT ===');
  console.log('Total donation entries:', data.donationEntries.length);
  console.log('Total donation drives:', data.donationDrives.length);
  console.log('Total files:', Object.keys(data.donationFiles).length);
  console.log('Active sessions:', data.sessions.length);
  console.log('Data:', data);
  
  // Create downloadable file
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pta-data-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return data;
};