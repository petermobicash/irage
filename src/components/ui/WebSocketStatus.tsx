import React, { useState, useEffect } from 'react';
import { websocketManager, ConnectionState, ConnectionEvent, getConnectionStatus } from '../../utils/websocketManager';

interface WebSocketStatusProps {
  onRetry?: () => void;
  onOfflineMode?: () => void;
  showDetails?: boolean;
}

interface StatusDisplay {
  state: ConnectionState;
  message: string;
  isConnected: boolean;
  canRetry: boolean;
  shouldShowOffline: boolean;
  errorDetails?: {
    type: string;
    description: string;
    solution: string;
  };
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  onRetry,
  onOfflineMode,
  showDetails = false
}) => {
  const [status, setStatus] = useState<StatusDisplay>({
    state: ConnectionState.DISCONNECTED,
    message: 'Disconnected',
    isConnected: false,
    canRetry: false,
    shouldShowOffline: false
  });
  
  const [stats, setStats] = useState(getConnectionStatus());

  useEffect(() => {
    const unsubscribe = websocketManager.addCallback((event: ConnectionEvent) => {
      setStatus(getStatusDisplay(event));
      setStats(getConnectionStatus());
    });

    // Initial status check
    const currentState = websocketManager.getState();
    setStatus(getStatusDisplay({ type: 'status_change', state: currentState }));
    setStats(getConnectionStatus());

    return unsubscribe;
  }, []);

  const getStatusDisplay = (event: ConnectionEvent): StatusDisplay => {
    const currentState = event.state || websocketManager.getState();
    
    const statusDisplays = {
      [ConnectionState.CONNECTED]: {
        state: currentState,
        message: 'Connected',
        isConnected: true,
        canRetry: false,
        shouldShowOffline: false,
        errorDetails: undefined
      },
      [ConnectionState.CONNECTING]: {
        state: currentState,
        message: 'Connecting...',
        isConnected: false,
        canRetry: false,
        shouldShowOffline: false
      },
      [ConnectionState.RECONNECTING]: {
        state: currentState,
        message: 'Reconnecting...',
        isConnected: false,
        canRetry: false,
        shouldShowOffline: false
      },
      [ConnectionState.OFFLINE]: {
        state: currentState,
        message: 'Offline - No internet connection',
        isConnected: false,
        canRetry: true,
        shouldShowOffline: false,
        errorDetails: {
          type: 'Network Error',
          description: 'Your device appears to be offline or the network connection is unavailable.',
          solution: 'Please check your internet connection and try again when you\'re back online.'
        }
      },
      [ConnectionState.FAILED]: {
        state: currentState,
        message: 'Connection Failed',
        isConnected: false,
        canRetry: true,
        shouldShowOffline: true,
        errorDetails: {
          type: 'Service Unavailable',
          description: 'Unable to connect to real-time services. This might be due to server maintenance or network issues.',
          solution: 'You can continue using the app in offline mode, or try reconnecting.'
        }
      },
      [ConnectionState.DISCONNECTED]: {
        state: currentState,
        message: 'Disconnected',
        isConnected: false,
        canRetry: true,
        shouldShowOffline: true,
        errorDetails: {
          type: 'Disconnected',
          description: 'The real-time connection has been lost.',
          solution: 'Try reconnecting or use offline mode to continue.'
        }
      }
    };

    return statusDisplays[currentState] || statusDisplays[ConnectionState.DISCONNECTED];
  };

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      await websocketManager.reconnect();
    }
  };

  const handleOfflineMode = () => {
    if (onOfflineMode) {
      onOfflineMode();
    }
  };

  const getStatusIcon = () => {
    switch (status.state) {
      case ConnectionState.CONNECTED:
        return (
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        );
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return (
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
        );
      case ConnectionState.OFFLINE:
        return (
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        );
      case ConnectionState.FAILED:
      case ConnectionState.DISCONNECTED:
        return (
          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
        );
      default:
        return (
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status.state) {
      case ConnectionState.CONNECTED:
        return 'text-green-600';
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return 'text-yellow-600';
      case ConnectionState.OFFLINE:
      case ConnectionState.FAILED:
      case ConnectionState.DISCONNECTED:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getButtonStyle = () => {
    switch (status.state) {
      case ConnectionState.CONNECTED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ConnectionState.OFFLINE:
      case ConnectionState.FAILED:
      case ConnectionState.DISCONNECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Don't render if connected and no details requested
  if (status.isConnected && !showDetails) {
    return null;
  }

  return (
    <div className={`p-4 rounded-lg border ${getButtonStyle()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>
            {status.message}
          </span>
        </div>
        
        {status.isConnected && (
          <span className="text-xs text-gray-500">
            ✓ Online
          </span>
        )}
      </div>

      {status.errorDetails && (
        <div className="mb-3">
          <p className="text-sm text-gray-700 mb-2">
            {status.errorDetails.description}
          </p>
          <p className="text-xs text-gray-600">
            <strong>Solution:</strong> {status.errorDetails.solution}
          </p>
        </div>
      )}

      {showDetails && (
        <div className="mb-3 text-xs text-gray-500 space-y-1">
          <div>State: {status.state}</div>
          <div>Attempts: {stats.reconnectAttempts}</div>
          <div>Channels: {stats.activeChannels}</div>
          {stats.lastPingTime > 0 && (
            <div>Last Ping: {new Date(stats.lastPingTime).toLocaleTimeString()}</div>
          )}
        </div>
      )}

      <div className="flex space-x-2">
        {status.canRetry && (
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
          >
            {status.state === ConnectionState.OFFLINE ? 'Retry Connection' : 'Reconnect'}
          </button>
        )}
        
        {status.shouldShowOffline && (
          <button
            onClick={handleOfflineMode}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
          >
            Use Offline Mode
          </button>
        )}
      </div>
    </div>
  );
};

export default WebSocketStatus;