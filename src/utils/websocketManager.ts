import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// WebSocket connection states
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
  OFFLINE = 'offline'
}

// WebSocket error types
export enum WebSocketError {
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  UNAUTHORIZED = 'unauthorized',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  COOKIE_ERROR = 'cookie_error',
  UNKNOWN = 'unknown'
}

// Connection event types
export type ConnectionEvent = {
  type: 'status_change' | 'error' | 'message' | 'reconnect_attempt';
  state?: ConnectionState;
  error?: WebSocketError;
  message?: string;
  attempts?: number;
};

// Connection status callback
export type ConnectionCallback = (event: ConnectionEvent) => void;

// Enhanced WebSocket connection manager
export class WebSocketManager {
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: Set<ConnectionCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000; // 1 second
  private maxReconnectDelay = 30000; // 30 seconds
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private isOffline = false;
  private lastPingTime = 0;
  private pingInterval = 30000; // 30 seconds
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupNetworkMonitoring();
  }

  // Setup network monitoring
  private setupNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Initial check
    this.isOffline = !navigator.onLine;
    if (this.isOffline) {
      this.updateState(ConnectionState.OFFLINE);
    }
  }

  // Handle online event
  private handleOnline() {
    console.log('🌐 Network connection restored');
    this.isOffline = false;
    if (this.state === ConnectionState.OFFLINE || this.state === ConnectionState.FAILED) {
      this.reconnect();
    }
  }

  // Handle offline event
  private handleOffline() {
    console.log('📴 Network connection lost');
    this.isOffline = true;
    this.updateState(ConnectionState.OFFLINE);
    this.cleanup();
  }

  // Add connection callback
  addCallback(callback: ConnectionCallback): () => void {
    this.callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  // Update connection state and notify callbacks
  private updateState(newState: ConnectionState, error?: WebSocketError, message?: string) {
    const oldState = this.state;
    this.state = newState;
    
    console.log(`🔄 WebSocket state changed: ${oldState} → ${newState}`);
    
    // Notify all callbacks
    this.callbacks.forEach(callback => {
      callback({
        type: 'status_change',
        state: newState,
        error,
        message
      });
    });
  }

  // Get current connection state
  getState(): ConnectionState {
    return this.state;
  }

  // Check if connected
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  // Check if connecting or reconnecting
  isConnecting(): boolean {
    return this.state === ConnectionState.CONNECTING || this.state === ConnectionState.RECONNECTING;
  }

  // Connect to Supabase realtime
  async connect(): Promise<boolean> {
    if (this.isConnecting() || this.isConnected()) {
      return true;
    }

    if (this.isOffline) {
      this.updateState(ConnectionState.OFFLINE, undefined, 'Cannot connect while offline');
      return false;
    }

    this.updateState(ConnectionState.CONNECTING);
    
    try {
      // Test basic connectivity first
      const isConnected = await this.testBasicConnectivity();
      if (!isConnected) {
        throw new Error('Basic connectivity test failed');
      }

      // Start connection timeout
      this.startConnectionTimeout();
      
      // Setup heartbeat
      this.startHeartbeat();
      
      // Setup health check
      this.startHealthCheck();
      
      this.updateState(ConnectionState.CONNECTED);
      console.log('✅ Successfully connected to Supabase realtime');
      return true;
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.handleConnectionError(error);
      return false;
    }
  }

  // Test basic connectivity to Supabase
  private async testBasicConnectivity(): Promise<boolean> {
    try {
      // Test with a simple query first
      const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      
      if (error) {
        console.warn('⚠️ Basic connectivity test failed:', error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('⚠️ Connectivity test error:', error);
      return false;
    }
  }

  // Start connection timeout
  private startConnectionTimeout() {
    this.clearConnectionTimeout();
    this.connectionTimeout = setTimeout(() => {
      console.error('⏰ WebSocket connection timeout');
      this.updateState(ConnectionState.FAILED, WebSocketError.TIMEOUT, 'Connection timeout');
      this.reconnect();
    }, 10000); // 10 second timeout
  }

  // Clear connection timeout
  private clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  // Start heartbeat
  private startHeartbeat() {
    this.clearHeartbeat();
    this.heartbeatInterval = setInterval(async () => {
      if (this.isConnected()) {
        await this.sendPing();
      }
    }, this.pingInterval);
  }

  // Clear heartbeat
  private clearHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Start health check
  private startHealthCheck() {
    this.clearHealthCheck();
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }

  // Clear health check
  private clearHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Send ping to check connection
  private async sendPing(): Promise<void> {
    try {
      this.lastPingTime = Date.now();
      // Simple query to test connection
      const { error } = await supabase.from('settings').select('key').limit(1);
      
      if (error && !error.message.includes('permission denied')) {
        console.warn('⚠️ Ping failed:', error.message);
        this.handleConnectionError(error);
      }
    } catch (error) {
      console.warn('⚠️ Ping error:', error);
      this.handleConnectionError(error);
    }
  }

  // Perform health check
  private async performHealthCheck(): Promise<void> {
    const now = Date.now();
    if (now - this.lastPingTime > this.pingInterval * 2) {
      console.warn('⚠️ Health check: No ping response, attempting reconnection');
      this.reconnect();
    }
  }

  // Handle connection errors
  private handleConnectionError(error: unknown): void {
    this.clearConnectionTimeout();
    
    let wsError: WebSocketError = WebSocketError.UNKNOWN;
    let message = 'Unknown connection error';
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        wsError = WebSocketError.NETWORK_ERROR;
        message = 'Network connection error';
      } else if (errorMessage.includes('timeout')) {
        wsError = WebSocketError.TIMEOUT;
        message = 'Connection timeout';
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
        wsError = WebSocketError.UNAUTHORIZED;
        message = 'Unauthorized access';
      } else if (errorMessage.includes('service unavailable') || errorMessage.includes('503')) {
        wsError = WebSocketError.SERVICE_UNAVAILABLE;
        message = 'Service temporarily unavailable';
      } else if (errorMessage.includes('cookie')) {
        wsError = WebSocketError.COOKIE_ERROR;
        message = 'Cookie validation error';
      } else {
        message = error.message;
      }
    }
    
    this.updateState(ConnectionState.FAILED, wsError, message);
    
    // Attempt to reconnect if not offline
    if (!this.isOffline) {
      setTimeout(() => this.reconnect(), 1000);
    }
  }

  // Reconnect with exponential backoff
  async reconnect(): Promise<boolean> {
    if (this.isConnecting() || this.isOffline) {
      return false;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.updateState(ConnectionState.FAILED, WebSocketError.SERVICE_UNAVAILABLE, 'Max reconnection attempts reached');
      return false;
    }

    this.reconnectAttempts++;
    this.updateState(ConnectionState.RECONNECTING, undefined, `Reconnection attempt ${this.reconnectAttempts}`);
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    // Notify callbacks about reconnection attempt
    this.callbacks.forEach(callback => {
      callback({
        type: 'reconnect_attempt',
        attempts: this.reconnectAttempts
      });
    });
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.connect();
  }

  // Subscribe to a table with enhanced error handling
  subscribeToTable(
    table: string,
    callback: (payload: unknown) => void,
    filter?: string
  ): { unsubscribe: () => void; channel: RealtimeChannel; subscription: any } {
    const channelName = `table-${table}-${Date.now()}`;
    const channel = supabase.channel(channelName);
    
    const subscription = channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(filter ? { filter } : {})
        },
        (payload) => {
          try {
            callback(payload);
          } catch (error) {
            console.error('❌ Subscription callback error:', error);
          }
        }
      )
      .subscribe(async (status) => {
        console.log(`📡 WebSocket subscription status for ${table}:`, status);
        
        if (status === 'CHANNEL_ERROR') {
          console.error(`❌ WebSocket subscription error for ${table}`);
          // Attempt to reconnect
          if (!this.isConnected()) {
            await this.reconnect();
          }
        } else if (status === 'SUBSCRIBED') {
          console.log(`✅ Successfully subscribed to ${table} changes`);
        } else if (status === 'TIMED_OUT') {
          console.warn(`⏰ WebSocket subscription timed out for ${table}`);
          // Attempt to resubscribe on timeout
          setTimeout(() => {
            if (this.isConnected() && !this.channels.has(channelName)) {
              console.log(`🔄 Attempting to resubscribe to ${table}`);
              this.subscribeToTable(table, callback, filter);
            }
          }, 5000);
        } else if (status === 'CLOSED') {
          console.log(`📴 WebSocket subscription closed for ${table}`);
        }
      });
    
    this.channels.set(channelName, channel);
    
    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
      },
      channel,
      subscription
    };
  }

  // Cleanup resources
  cleanup(): void {
    this.clearHeartbeat();
    this.clearConnectionTimeout();
    this.clearHealthCheck();
    
    // Remove all channels
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    
    // Reset state
    this.updateState(ConnectionState.DISCONNECTED);
    this.reconnectAttempts = 0;
  }

  // Get connection statistics
  getStats() {
    return {
      state: this.state,
      reconnectAttempts: this.reconnectAttempts,
      isConnected: this.isConnected(),
      isOffline: this.isOffline,
      activeChannels: this.channels.size,
      lastPingTime: this.lastPingTime
    };
  }
}

// Create singleton instance
export const websocketManager = new WebSocketManager();

// Connection helper with retry logic
export const connectWithRetry = async (maxRetries = 3): Promise<boolean> => {
  let success = await websocketManager.connect();
  
  for (let attempt = 1; attempt < maxRetries && !success; attempt++) {
    console.log(`🔄 Connection retry attempt ${attempt + 1}/${maxRetries}`);
    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    success = await websocketManager.connect();
  }
  
  return success;
};

// Enhanced subscription helper
export const subscribeToTableWithRetry = (
  table: string,
  callback: (payload: unknown) => void,
  filter?: string
): { unsubscribe: () => void; channel: RealtimeChannel; subscription: any } => {
  return websocketManager.subscribeToTable(table, callback, filter);
};

// Check if WebSocket is available
export const isWebSocketAvailable = (): boolean => {
  try {
    return 'WebSocket' in window && websocketManager.isConnected();
  } catch {
    return false;
  }
};

// Get connection status
export const getConnectionStatus = () => {
  return websocketManager.getStats();
};