// Supabase connection diagnostics and troubleshooting utilities

import { supabase } from '../lib/supabase';

export interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
  suggestions?: string[];
}

export interface ConnectionTest {
  name: string;
  test: () => Promise<DiagnosticResult>;
}

/**
 * Test basic connectivity to Supabase
 */
export async function testBasicConnectivity(): Promise<DiagnosticResult> {
  try {
    const startTime = Date.now();
    
    // Test with a simple query
    const { data, error } = await supabase
      .from('content')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        success: false,
        message: `Database connection failed: ${error.message}`,
        details: { error, responseTime },
        suggestions: [
          'Check your internet connection',
          'Verify Supabase project URL and API key in .env file',
          'Ensure Supabase project is not paused or over quotas',
          'Check if your domain is allowed in Supabase CORS settings'
        ]
      };
    }
    
    return {
      success: true,
      message: `Database connection successful (${responseTime}ms)`,
      details: { responseTime, dataCount: data?.length || 0 }
    };
  } catch (err) {
    return {
      success: false,
      message: `Connection test failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      details: err instanceof Error ? { message: err.message, stack: err.stack } : { error: String(err) },
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Clear browser cache and cookies',
        'Check if firewall is blocking the connection'
      ]
    };
  }
}

/**
 * Test CORS specifically
 */
export async function testCORS(): Promise<DiagnosticResult> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        message: 'Supabase configuration missing',
        suggestions: [
          'Set VITE_SUPABASE_URL in your .env file',
          'Set VITE_SUPABASE_ANON_KEY in your .env file',
          'Make sure your .env file is in the project root'
        ]
      };
    }
    
    // Test CORS with a direct fetch
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      return {
        success: false,
        message: `CORS test failed: ${response.status} ${response.statusText}`,
        suggestions: [
          'Check your Supabase project CORS settings',
          'Add your domain to allowed origins in Supabase',
          'Ensure Supabase project is active'
        ]
      };
    }
    
    return {
      success: true,
      message: 'CORS configuration appears to be working',
      details: { status: response.status, statusText: response.statusText }
    };
  } catch (err) {
    return {
      success: false,
      message: `CORS test failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      details: err instanceof Error ? { message: err.message, stack: err.stack } : { error: String(err) },
      suggestions: [
        'Check your internet connection',
        'Verify CORS settings in your Supabase project dashboard',
        'Try accessing your Supabase URL directly in browser',
        'Check if ad-blockers or extensions are blocking the request'
      ]
    };
  }
}

/**
 * Test authentication endpoint
 */
export async function testAuthEndpoint(): Promise<DiagnosticResult> {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error && error.message?.includes('Invalid') && error.message?.includes('token')) {
      // This is expected for anonymous users
      return {
        success: true,
        message: 'Authentication endpoint working (no active session)',
        details: { error: 'Expected for anonymous users' }
      };
    }
    
    if (error) {
      return {
        success: false,
        message: `Authentication test failed: ${error.message}`,
        suggestions: [
          'Check if Supabase auth service is enabled',
          'Verify your Supabase project configuration'
        ]
      };
    }
    
    return {
      success: true,
      message: 'Authentication endpoint working',
      details: { user: data.user ? 'Authenticated user' : 'Anonymous user' }
    };
  } catch (err) {
    return {
      success: false,
      message: `Authentication test failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      details: err instanceof Error ? { message: err.message, stack: err.stack } : { error: String(err) },
      suggestions: [
        'Check Supabase auth configuration',
        'Try refreshing the page'
      ]
    };
  }
}

/**
 * Run all diagnostic tests
 */
export async function runDiagnostics(): Promise<{
  connectivity: DiagnosticResult;
  cors: DiagnosticResult;
  auth: DiagnosticResult;
}> {
  const [connectivity, cors, auth] = await Promise.all([
    testBasicConnectivity(),
    testCORS(),
    testAuthEndpoint()
  ]);
  
  return { connectivity, cors, auth };
}

/**
 * Check if specific error is likely a CORS issue
 */
export function isCORSError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = (error as { message?: string })?.message || String(error);

  return (
    errorMessage.includes('CORS') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('Cross-Origin') ||
    ((error as { status?: unknown })?.status === null && (error as { code?: unknown })?.code === null)
  );
}

/**
 * Get troubleshooting suggestions based on error type
 */
export function getTroubleshootingSuggestions(error: unknown): string[] {
  if (isCORSError(error)) {
    return [
      'Check your internet connection',
      'Verify Supabase CORS settings in your project dashboard',
      'Ensure your domain is added to allowed origins',
      'Try refreshing the page',
      'Clear browser cache and cookies',
      'Check if browser extensions are blocking requests',
      'Try accessing your Supabase URL directly to confirm it\'s accessible'
    ];
  }

  const errorMessage = (error as { message?: string })?.message || '';

  if (errorMessage.includes('timeout')) {
    return [
      'Check your internet connection',
      'The request might be taking too long to complete',
      'Try again in a moment'
    ];
  }

  if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return [
      'Check your Supabase API keys',
      'Verify your authentication token',
      'Contact an administrator if the problem persists'
    ];
  }

  return [
    'Please try refreshing the page',
    'If the problem persists, contact support'
  ];
}

/**
 * Format diagnostic results for display
 */
export function formatDiagnostics(results: {
  connectivity: DiagnosticResult;
  cors: DiagnosticResult;
  auth: DiagnosticResult;
}): string {
  let output = '🔍 Supabase Connection Diagnostics\n\n';
  
  output += `📡 Connectivity: ${results.connectivity.success ? '✅' : '❌'} ${results.connectivity.message}\n`;
  if (!results.connectivity.success && results.connectivity.suggestions) {
    output += '   Suggestions:\n';
    results.connectivity.suggestions.forEach(suggestion => {
      output += `   • ${suggestion}\n`;
    });
  }
  
  output += `\n🌐 CORS: ${results.cors.success ? '✅' : '❌'} ${results.cors.message}\n`;
  if (!results.cors.success && results.cors.suggestions) {
    output += '   Suggestions:\n';
    results.cors.suggestions.forEach(suggestion => {
      output += `   • ${suggestion}\n`;
    });
  }
  
  output += `\n🔐 Authentication: ${results.auth.success ? '✅' : '❌'} ${results.auth.message}\n`;
  if (!results.auth.success && results.auth.suggestions) {
    output += '   Suggestions:\n';
    results.auth.suggestions.forEach(suggestion => {
      output += `   • ${suggestion}\n`;
    });
  }
  
  return output;
}