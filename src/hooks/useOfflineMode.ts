import { useState, useEffect, useCallback } from 'react';
import { websocketManager, ConnectionState, isWebSocketAvailable } from '../utils/websocketManager';

// Offline mode data types
interface OfflineData {
  id: string;
  type: string;
  action: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
  retryCount: number;
}

interface OfflineQueue {
  data: OfflineData[];
  maxSize: number;
}

// Offline mode hook
export const useOfflineMode = () => {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueue>({
    data: [],
    maxSize: 100
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Load offline queue from localStorage
  useEffect(() => {
    const savedQueue = localStorage.getItem('offline_queue');
    if (savedQueue) {
      try {
        const parsedQueue = JSON.parse(savedQueue);
        setOfflineQueue(parsedQueue);
      } catch (error) {
        console.error('Error loading offline queue:', error);
      }
    }
  }, []);

  // Save offline queue to localStorage
  const saveOfflineQueue = useCallback((queue: OfflineQueue) => {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }, []);

  // Check if we should use offline mode
  const shouldUseOfflineMode = useCallback(() => {
    const connectionState = websocketManager.getState();
    return connectionState === ConnectionState.FAILED || 
           connectionState === ConnectionState.OFFLINE ||
           !isWebSocketAvailable();
  }, []);

  // Add data to offline queue
  const addToOfflineQueue = useCallback((type: string, action: 'create' | 'update' | 'delete', data: unknown) => {
    const offlineItem: OfflineData = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    setOfflineQueue(prevQueue => {
      const newQueue = {
        ...prevQueue,
        data: [...prevQueue.data, offlineItem].slice(-prevQueue.maxSize) // Keep only the latest items
      };
      saveOfflineQueue(newQueue);
      return newQueue;
    });

    return offlineItem.id;
  }, [saveOfflineQueue]);

  // Remove item from offline queue
  const removeFromOfflineQueue = useCallback((id: string) => {
    setOfflineQueue(prevQueue => {
      const newQueue = {
        ...prevQueue,
        data: prevQueue.data.filter(item => item.id !== id)
      };
      saveOfflineQueue(newQueue);
      return newQueue;
    });
  }, [saveOfflineQueue]);

  // Retry offline queue items
  const retryOfflineItems = useCallback(async () => {
    if (syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    const itemsToRetry = [...offlineQueue.data];
    
    for (const item of itemsToRetry) {
      try {
        // Here you would implement the actual sync logic
        // This would depend on your specific data types and backend API
        console.log('Retrying offline item:', item);
        
        // Simulate successful sync
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Remove successfully synced items
        removeFromOfflineQueue(item.id);
        
      } catch (error) {
        console.error('Error syncing offline item:', item, error);
        
        // Increment retry count
        setOfflineQueue(prevQueue => ({
          ...prevQueue,
          data: prevQueue.data.map(queueItem => 
            queueItem.id === item.id 
              ? { ...queueItem, retryCount: queueItem.retryCount + 1 }
              : queueItem
          )
        }));
      }
    }
    
    setSyncStatus('idle');
  }, [offlineQueue.data, removeFromOfflineQueue, syncStatus]);

  // Enable offline mode
  const enableOfflineMode = useCallback(() => {
    setIsOfflineMode(true);
    localStorage.setItem('offline_mode_enabled', 'true');
  }, []);

  // Disable offline mode
  const disableOfflineMode = useCallback(() => {
    setIsOfflineMode(false);
    localStorage.removeItem('offline_mode_enabled');
    
    // Attempt to sync when going back online
    if (websocketManager.isConnected()) {
      retryOfflineItems();
    }
  }, [retryOfflineItems]);

  // Initialize offline mode state
  useEffect(() => {
    const isEnabled = localStorage.getItem('offline_mode_enabled') === 'true';
    setIsOfflineMode(isEnabled);
  }, []);

  // Auto-enable offline mode when connection fails
  useEffect(() => {
    const unsubscribe = websocketManager.addCallback((event) => {
      if (event.state === ConnectionState.FAILED && !isOfflineMode) {
        console.log('🔄 Auto-enabling offline mode due to connection failure');
        enableOfflineMode();
      }
    });

    return unsubscribe;
  }, [isOfflineMode, enableOfflineMode]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (websocketManager.isConnected() && isOfflineMode) {
      console.log('🔄 Auto-syncing offline data when connection restored');
      retryOfflineItems();
    }
  }, [isOfflineMode, retryOfflineItems]);

  // Get queue statistics
  const getQueueStats = useCallback(() => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    return {
      totalItems: offlineQueue.data.length,
      itemsFromToday: offlineQueue.data.filter(item => item.timestamp > oneDayAgo).length,
      oldestItem: offlineQueue.data.length > 0 ? Math.min(...offlineQueue.data.map(item => item.timestamp)) : null,
      newestItem: offlineQueue.data.length > 0 ? Math.max(...offlineQueue.data.map(item => item.timestamp)) : null,
      maxRetries: Math.max(...offlineQueue.data.map(item => item.retryCount), 0)
    };
  }, [offlineQueue.data]);

  // Clear offline queue
  const clearOfflineQueue = useCallback(() => {
    setOfflineQueue({ data: [], maxSize: offlineQueue.maxSize });
    saveOfflineQueue({ data: [], maxSize: offlineQueue.maxSize });
  }, [offlineQueue.maxSize, saveOfflineQueue]);

  return {
    // State
    isOfflineMode,
    offlineQueue: offlineQueue.data,
    syncStatus,
    
    // Actions
    enableOfflineMode,
    disableOfflineMode,
    addToOfflineQueue,
    removeFromOfflineQueue,
    retryOfflineItems,
    clearOfflineQueue,
    
    // Computed
    shouldUseOfflineMode: shouldUseOfflineMode(),
    queueStats: getQueueStats(),
    canSync: syncStatus !== 'syncing' && websocketManager.isConnected() && offlineQueue.data.length > 0
  };
};

// Higher-order hook for offline-capable data operations
export const useOfflineData = <T>(
  tableName: string,
  dataOperations: {
    create: (data: T) => Promise<{ success: boolean; error?: unknown }>;
    update: (id: string, data: Partial<T>) => Promise<{ success: boolean; error?: unknown }>;
    delete: (id: string) => Promise<{ success: boolean; error?: unknown }>;
  }
) => {
  const offline = useOfflineMode();

  // Create with offline support
  const createWithOffline = useCallback(async (data: T) => {
    if (offline.shouldUseOfflineMode || offline.isOfflineMode) {
      const offlineId = offline.addToOfflineQueue(tableName, 'create', data);
      return { 
        success: true, 
        offline: true, 
        offlineId 
      };
    }

    try {
      return await dataOperations.create(data);
    } catch (error) {
      // Fallback to offline on error
      const offlineId = offline.addToOfflineQueue(tableName, 'create', data);
      return { 
        success: true, 
        offline: true, 
        offlineId,
        error 
      };
    }
  }, [offline, tableName, dataOperations]);

  // Update with offline support
  const updateWithOffline = useCallback(async (id: string, data: Partial<T>) => {
    if (offline.shouldUseOfflineMode || offline.isOfflineMode) {
      const offlineId = offline.addToOfflineQueue(tableName, 'update', { id, data });
      return { 
        success: true, 
        offline: true, 
        offlineId 
      };
    }

    try {
      return await dataOperations.update(id, data);
    } catch (error) {
      // Fallback to offline on error
      const offlineId = offline.addToOfflineQueue(tableName, 'update', { id, data });
      return { 
        success: true, 
        offline: true, 
        offlineId,
        error 
      };
    }
  }, [offline, tableName, dataOperations]);

  // Delete with offline support
  const deleteWithOffline = useCallback(async (id: string) => {
    if (offline.shouldUseOfflineMode || offline.isOfflineMode) {
      const offlineId = offline.addToOfflineQueue(tableName, 'delete', { id });
      return { 
        success: true, 
        offline: true, 
        offlineId 
      };
    }

    try {
      return await dataOperations.delete(id);
    } catch (error) {
      // Fallback to offline on error
      const offlineId = offline.addToOfflineQueue(tableName, 'delete', { id });
      return { 
        success: true, 
        offline: true, 
        offlineId,
        error 
      };
    }
  }, [offline, tableName, dataOperations]);

  return {
    create: createWithOffline,
    update: updateWithOffline,
    delete: deleteWithOffline,
    ...offline
  };
};

export default useOfflineMode;