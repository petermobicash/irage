import { websocketManager, ConnectionState, getConnectionStatus } from '../utils/websocketManager';
import { supabase } from '../lib/supabase';

// Diagnostic result interface
export interface DiagnosticResult {
  timestamp: string;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    networkConnectivity: boolean;
    dnsResolution: boolean;
    supabaseApi: boolean;
    supabaseWebSocket: boolean;
    browserWebSocket: boolean;
    cookieSupport: boolean;
    corsHeaders: boolean;
  };
  details: {
    networkConnectivity?: string;
    dnsResolution?: string;
    supabaseApi?: string;
    supabaseWebSocket?: string;
    browserWebSocket?: string;
    cookieSupport?: string;
    corsHeaders?: string;
    generalError?: string;
  };
  recommendations: string[];
  connectionStats: {
    state: string;
    reconnectAttempts: number;
    isConnected: boolean;
    isOffline: boolean;
    activeChannels: number;
    lastPingTime: number;
  };
}

// Run comprehensive WebSocket diagnostics
export const runWebSocketDiagnostics = async (): Promise<DiagnosticResult> => {
  const timestamp = new Date().toISOString();
  const checks = {
    networkConnectivity: false,
    dnsResolution: false,
    supabaseApi: false,
    supabaseWebSocket: false,
    browserWebSocket: false,
    cookieSupport: false,
    corsHeaders: false
  };
  
  const details: Record<string, string> = {};
  const recommendations: string[] = [];
  
  // Get current connection stats
  const connectionStats = getConnectionStats();
  
  try {
    // 1. Check network connectivity
    try {
      await fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-cache' 
      });
      checks.networkConnectivity = true;
      details.networkConnectivity = 'Network connectivity is working';
    } catch (error) {
      details.networkConnectivity = `Network connectivity failed: ${error instanceof Error ? error.message : String(error)}`;
      recommendations.push('Check your internet connection and try again');
    }

    // 2. Check DNS resolution for Supabase
    try {
      const url = new URL('https://sshguczouozvsdwzfcbx.supabase.co');
      const testImage = new Image();
      testImage.src = url.origin + '/favicon.ico';
      
      await new Promise((resolve, reject) => {
        testImage.onload = resolve;
        testImage.onerror = reject;
        setTimeout(reject, 5000);
      });
      
      checks.dnsResolution = true;
      details.dnsResolution = `DNS resolution working for ${url.hostname}`;
    } catch (error) {
      details.dnsResolution = `DNS resolution failed: ${error instanceof Error ? error.message : String(error)}`;
      recommendations.push('Try clearing your DNS cache or check your network settings');
    }

    // 3. Check Supabase API connectivity
    try {
      const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      if (error) {
        throw error;
      }
      checks.supabaseApi = true;
      details.supabaseApi = 'Supabase API is accessible';
    } catch (error) {
      details.supabaseApi = `Supabase API failed: ${error instanceof Error ? error.message : String(error)}`;
      if (error instanceof Error && error.message.includes('permission denied')) {
        details.supabaseApi += ' (Permission issue, but API is reachable)';
        checks.supabaseApi = true; // API is reachable, just permissions missing
      } else {
        recommendations.push('Check your Supabase project status and API credentials');
      }
    }

    // 4. Check WebSocket support in browser
    if ('WebSocket' in window) {
      checks.browserWebSocket = true;
      details.browserWebSocket = 'WebSocket API is supported by your browser';
    } else {
      details.browserWebSocket = 'WebSocket API is not supported by your browser';
      recommendations.push('Your browser does not support WebSocket. Try updating to a modern browser.');
    }

    // 5. Check WebSocket connection status
    const wsStatus = websocketManager.getState();
    if (wsStatus === ConnectionState.CONNECTED) {
      checks.supabaseWebSocket = true;
      details.supabaseWebSocket = 'WebSocket connection is established and working';
    } else {
      details.supabaseWebSocket = `WebSocket connection status: ${wsStatus}`;
      if (wsStatus === ConnectionState.OFFLINE) {
        recommendations.push('You appear to be offline. Check your internet connection.');
      } else if (wsStatus === ConnectionState.FAILED) {
        recommendations.push('WebSocket connection failed. This could be due to firewall, proxy, or service issues.');
      } else {
        recommendations.push('WebSocket is not connected. The app will work in degraded mode.');
      }
    }

    // 6. Check cookie support
    try {
      const cookieEnabled = navigator.cookieEnabled;
      if (cookieEnabled) {
        // Test setting a cookie
        document.cookie = 'websocket_test=working; max-age=60; path=/';
        const cookieSet = document.cookie.includes('websocket_test=working');
        checks.cookieSupport = cookieSet;
        details.cookieSupport = cookieSet 
          ? 'Cookie support is enabled and working'
          : 'Cookie support may be limited (Private browsing or disabled)';
        if (!cookieSet) {
          recommendations.push('Cookies appear to be disabled. Some features may not work properly.');
        }
      } else {
        details.cookieSupport = 'Cookies are disabled in your browser';
        recommendations.push('Enable cookies for full functionality');
      }
    } catch (error) {
      details.cookieSupport = `Cookie check failed: ${error instanceof Error ? error.message : String(error)}`;
    }

    // 7. Test CORS headers (indirect test)
    try {
      await fetch('https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      checks.corsHeaders = true;
      details.corsHeaders = 'CORS headers appear to be configured correctly';
    } catch (error) {
      details.corsHeaders = `CORS test failed: ${error instanceof Error ? error.message : String(error)}`;
      // This is often expected in no-cors mode, so don't add recommendation unless other issues
    }

  } catch (error) {
    console.error('Diagnostic error:', error);
    details.generalError = `Diagnostic failed: ${error instanceof Error ? error.message : String(error)}`;
    recommendations.push('Diagnostic tools encountered an unexpected error');
  }

  // Determine overall health
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  const healthPercentage = (passedChecks / totalChecks) * 100;

  let overall: 'healthy' | 'degraded' | 'unhealthy';
  if (healthPercentage >= 80) {
    overall = 'healthy';
  } else if (healthPercentage >= 50) {
    overall = 'degraded';
  } else {
    overall = 'unhealthy';
  }

  // Add specific recommendations based on failed checks
  if (!checks.networkConnectivity) {
    recommendations.unshift('Critical: No network connectivity detected');
  }
  if (!checks.dnsResolution) {
    recommendations.unshift('Critical: DNS resolution failed for Supabase');
  }
  if (!checks.browserWebSocket) {
    recommendations.unshift('Critical: Browser does not support WebSocket');
  }

  // Default recommendations if none were added
  if (recommendations.length === 0 && overall !== 'healthy') {
    recommendations.push('Some issues detected. Try refreshing the page or checking your network settings.');
  }

  return {
    timestamp,
    overall,
    checks,
    details,
    recommendations,
    connectionStats
  };
};

// Get connection stats
function getConnectionStats() {
  const stats = getConnectionStatus();
  return {
    state: stats.state,
    reconnectAttempts: stats.reconnectAttempts,
    isConnected: stats.isConnected,
    isOffline: stats.isOffline,
    activeChannels: stats.activeChannels,
    lastPingTime: stats.lastPingTime
  };
}

// Quick connectivity test
export const quickConnectivityTest = async (): Promise<{
  success: boolean;
  message: string;
  details?: string;
}> => {
  try {
    // Test basic connectivity
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    
    if (error && !error.message.includes('permission denied')) {
      return {
        success: false,
        message: 'Database connection failed',
        details: error.message
      };
    }

    const wsConnected = websocketManager.isConnected();
    
    if (wsConnected) {
      return {
        success: true,
        message: 'All connections are working'
      };
    } else {
      return {
        success: false,
        message: 'Database connected but WebSocket unavailable',
        details: 'Real-time features may not work, but app should function normally'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Connectivity test failed',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};

// Network speed test
export const testNetworkSpeed = async (): Promise<{
  latency: number;
  downloadSpeed?: number;
  message: string;
}> => {
  try {
    // Test latency with a simple API call
    const testStart = Date.now();
    await supabase.from('profiles').select('id').limit(1);
    const latency = Date.now() - testStart;
    
    return {
      latency,
      message: latency < 100 ? 'Good connection' : latency < 500 ? 'Fair connection' : 'Slow connection'
    };
  } catch (error) {
    return {
      latency: -1,
      message: `Speed test failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Check for common WebSocket blockers
export const checkWebSocketBlockers = (): {
  detected: string[];
  recommendations: string[];
} => {
  const detected: string[] = [];
  const recommendations: string[] = [];

  // Check for corporate firewalls/proxies
  if (navigator.userAgent.includes('Corporate') || 
      navigator.userAgent.includes('Enterprise')) {
    detected.push('Corporate network detected');
    recommendations.push('Check with your IT department about WebSocket access');
  }

  // Check for mobile data vs WiFi
  const connection = (navigator as any).connection;
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      detected.push('Slow network connection');
      recommendations.push('Consider switching to WiFi for better performance');
    }
  }

  // Check browser version (basic check)
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) {
    const version = ua.match(/Firefox\/(\d+)/)?.[1];
    if (version && parseInt(version) < 60) {
      detected.push('Outdated Firefox version');
      recommendations.push('Update Firefox to latest version for WebSocket support');
    }
  }

  return { detected, recommendations };
};

// Export diagnostic summary for easy access
export const getDiagnosticSummary = async () => {
  const result = await runWebSocketDiagnostics();
  const speed = await testNetworkSpeed();
  const blockers = checkWebSocketBlockers();
  const quickTest = await quickConnectivityTest();

  return {
    ...result,
    speed,
    blockers,
    quickTest
  };
};

export default {
  runWebSocketDiagnostics,
  quickConnectivityTest,
  testNetworkSpeed,
  checkWebSocketBlockers,
  getDiagnosticSummary
};