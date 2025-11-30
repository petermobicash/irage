/**
 * Cloudflare Cookie Fix Module
 * Specialized solution for "__cf_bm" cookie domain validation errors
 */

export class CloudflareCookieFix {
    constructor() {
        // Cookie domains will be calculated when needed
    }

    getCookieDomains(): string[] {
        return [
            window.location.hostname,
            window.location.hostname.replace(/^www\./, ''),
            window.location.hostname.startsWith('www.') ? window.location.hostname : 'www.' + window.location.hostname
        ];
    }

    /**
     * Main fix function for Cloudflare cookie issues
     */
    fixCloudflareCookies() {
        console.log('🔧 Starting Cloudflare cookie fix...');
        
        const results = {
            cleared: 0,
            set: 0,
            errors: [] as string[]
        };

        try {
            // Step 1: Clear existing problematic cookies
            const clearedCount = this.clearProblematicCookies();
            results.cleared = clearedCount;
            
            // Step 2: Set proper domain cookies
            this.setProperDomainCookies();
            
            // Step 3: Clear browser cache indicators
            this.clearCacheIndicators();
            
            // Step 4: Validate domain configuration
            const domainValidation = this.validateDomainConfiguration();
            
            console.log('✅ Cloudflare cookie fix completed');
            return {
                success: true,
                clearedCount,
                domainValidation,
                message: 'Cloudflare cookies have been cleared and reset'
            };
            
        } catch (error) {
            console.error('❌ Cloudflare cookie fix failed:', error);
            results.errors.push((error as any).message || 'Unknown error');
            return {
                success: false,
                error: (error as any).message || 'Unknown error',
                results
            };
        }
    }

    /**
     * Clear all Cloudflare-related cookies that might be causing issues
     */
    clearProblematicCookies() {
        const cfCookieNames = [
            '__cf_bm',
            'cf_clearance',
            '__cfduid',
            '__cflb',
            '__cfruid'
        ];
        
        let clearedCount = 0;

        cfCookieNames.forEach(cookieName => {
            this.getCookieDomains().forEach(domain => {
                try {
                    // Clear with full domain path
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=none; secure;`;
                    clearedCount++;
                } catch (err) {
                    console.warn(`Failed to clear cookie ${cookieName} for domain ${domain}:`, err);
                }
            });
        });

        // Also clear any cookies that contain cf_ pattern
        const allCookies = document.cookie.split(';');
        allCookies.forEach(cookie => {
            const cookieName = cookie.split('=')[0].trim();
            if (cookieName.includes('cf_')) {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                clearedCount++;
            }
        });

        console.log(`🧹 Cleared ${clearedCount} Cloudflare cookies`);
        return clearedCount;
    }

    /**
     * Set proper domain cookies to help with validation
     */
    setProperDomainCookies() {
        const timestamp = Date.now();
        const domainInfo = {
            domain: window.location.hostname,
            protocol: window.location.protocol,
            timestamp
        };

        // Set a test cookie with proper domain configuration
        this.getCookieDomains().forEach(domain => {
            try {
                document.cookie = `domain_test=${timestamp}; path=/; domain=.${domain}; max-age=3600; samesite=lax`;
                document.cookie = `domain_test=${timestamp}; path=/; domain=${domain}; max-age=3600; samesite=lax`;
            } catch (err) {
                console.warn(`Failed to set test cookie for domain ${domain}:`, err);
            }
        });

        // Store domain info for debugging
        try {
            localStorage.setItem('cf_fix_domain_info', JSON.stringify(domainInfo));
        } catch (error) {
            console.warn('Failed to store domain info:', error);
        }
    }

    /**
     * Clear various cache-related indicators
     */
    clearCacheIndicators() {
        // Clear service worker cache if available
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.unregister();
                });
            });
        }

        // Clear relevant localStorage items
        const keysToRemove = [
            'cf_clearance',
            '__cf_bm',
            '__cfduid',
            '__cflb',
            '__cfruid'
        ];

        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            } catch {
                // Ignore storage errors
            }
        });

        // Clear relevant indexedDB entries
        if ('indexedDB' in window) {
            try {
                const databases = ['cf_cache', 'cloudflare_cache'];
                databases.forEach(dbName => {
                    const request = indexedDB.deleteDatabase(dbName);
                    request.onsuccess = () => console.log(`Deleted database: ${dbName}`);
                });
            } catch (err) {
                console.warn('Failed to clear IndexedDB:', err);
            }
        }
    }

    /**
     * Validate domain configuration and provide recommendations
     */
    validateDomainConfiguration() {
        const currentDomain = window.location.hostname;
        const protocol = window.location.protocol;
        const hasWWW = currentDomain.startsWith('www.');
        
        const issues = [];
        const recommendations = [];

        // Check protocol
        if (protocol !== 'https:' && window.location.hostname !== 'localhost') {
            issues.push('Not using HTTPS protocol');
            recommendations.push('Ensure site is served over HTTPS for proper cookie handling');
        }

        // Check www/non-www consistency
        if (hasWWW) {
            recommendations.push('Domain uses www. Consider setting up redirects for consistency');
        } else {
            recommendations.push('Domain does not use www. Consider setting up redirects for consistency');
        }

        // Check for localhost/development
        if (currentDomain === 'localhost' || currentDomain.includes('127.0.0.1')) {
            recommendations.push('Development environment detected - some cookie restrictions may not apply');
        }

        // Check for IP addresses
        if (/^\d+\.\d+\.\d+\.\d+$/.test(currentDomain)) {
            issues.push('Using IP address instead of domain name');
            recommendations.push('Use proper domain name for production deployment');
        }

        return {
            currentDomain,
            protocol,
            hasWWW,
            issues,
            recommendations,
            isValid: issues.length === 0
        };
    }

    /**
     * Enhanced WebSocket connection with cookie fix integration
     */
    async connectWithCookieFix(url?: string, options?: any) {
        console.log('🔌 Connecting with Cloudflare cookie fix...');
        
        // Apply cookie fixes before connecting
        const fixResult = this.fixCloudflareCookies();
        
        if (!fixResult.success) {
            console.warn('⚠️ Cookie fix had issues, but continuing with connection attempt');
        }

        // Wait a moment for cookies to clear
        await new Promise(resolve => setTimeout(resolve, 500));

        // Test connection with enhanced error handling
        return new Promise((resolve, reject) => {
            const wsUrl = url || `wss://sshguczouozvsdwzfcbx.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Nzk2ODEsImV4cCI6MjA3OTA1NTY4MX0.ooh5NGBqv6U0MLcwvURzcf-DVx_qvpYobdjy-ukpKbw&eventsPerSecond=5&vsn=1.0.0`;
            
            const ws = new WebSocket(wsUrl);
            
            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error('Connection timeout after 10 seconds'));
            }, 10000);

            ws.onopen = () => {
                clearTimeout(timeout);
                console.log('✅ WebSocket connection established after cookie fix!');
                resolve({
                    success: true,
                    fixApplied: fixResult,
                    message: 'Connected successfully with cookie fixes'
                });
            };

            ws.onerror = (error) => {
                clearTimeout(timeout);
                
                // Enhanced error handling for cookie-specific issues
                const errorMessage = (error as any).message || '';
                if (
                    errorMessage.includes('__cf_bm') ||
                    errorMessage.includes('Cloudflare') ||
                    errorMessage.includes('cookie') ||
                    errorMessage.includes('domain') ||
                    errorMessage.includes('rejected')
                ) {
                    console.log('🔄 Cookie-related error detected, trying alternative fix...');
                    
                    // Try more aggressive cookie clearing
                    this.aggressiveCookieClear();
                    
                    // Retry after aggressive clear
                    setTimeout(() => {
                        this.connectWithCookieFix(url, options).then(resolve).catch(reject);
                    }, 1000);
                } else {
                    reject({
                        success: false,
                        error: errorMessage,
                        fixApplied: fixResult,
                        type: 'websocket_error'
                    });
                }
            };

            ws.onclose = (event) => {
                clearTimeout(timeout);
                console.log('🔌 WebSocket closed:', event.code, event.reason);
                
                if (event.code === 1006) {
                    // Abnormal closure - often related to cookie issues
                    console.log('🔄 Abnormal closure detected, possible cookie issue');
                    reject({
                        success: false,
                        error: 'Abnormal closure (possible cookie issue)',
                        fixApplied: fixResult,
                        code: event.code
                    });
                }
            };
        });
    }

    /**
     * Global method to fix Supabase WebSocket connections specifically
     */
    async fixSupabaseWebSocket() {
        console.log('🔧 Fixing Supabase WebSocket connection...');
        
        try {
            // Clear cookies before connecting
            this.fixCloudflareCookies();
            
            // Wait for clearing to complete
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Import and use Supabase with the fix
            const { createClient } = await import('@supabase/supabase-js');
            
            const supabaseUrl = (window as any).__SUPABASE_URL__ || 'https://sshguczouozvsdwzfcbx.supabase.co';
            const supabaseKey = (window as any).__SUPABASE_ANON_KEY__ || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Nzk2ODEsImV4cCI6MjA3OTA1NTY4MX0.ooh5NGBqv6U0MLcwvURzcf-DVx_qvpYobdjy-ukpKbw';
            
            const supabase = createClient(supabaseUrl, supabaseKey, {
                realtime: {
                    params: {
                        eventsPerSecond: 5,
                    },
                },
                global: {
                    headers: {
                        'x-client-info': 'benirage-web-platform'
                    }
                }
            });

            return {
                success: true,
                supabase,
                message: 'Supabase client created with cookie fixes applied'
            };
            
        } catch (error) {
            console.error('❌ Failed to create fixed Supabase client:', error);
            return {
                success: false,
                error: (error as any).message || 'Unknown error',
                message: 'Failed to create Supabase client'
            };
        }
    }

    /**
     * Aggressive cookie clearing for stubborn Cloudflare cookie issues
     */
    aggressiveCookieClear() {
        console.log('🧹 Performing aggressive cookie clearing...');
        
        const cookieDomains = [
            window.location.hostname,
            window.location.hostname.replace(/^www\./, ''),
            window.location.hostname.startsWith('www.') ? window.location.hostname : 'www.' + window.location.hostname
        ];
        
        // Clear ALL cookies
        document.cookie.split(';').forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            
            // Clear with multiple domain variations
            cookieDomains.forEach((domain: string) => {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
            });
            
            // Clear with different path combinations
            const paths = ['/', '/api', '/realtime'];
            paths.forEach(path => {
                cookieDomains.forEach((domain: string) => {
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=.${domain};`;
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
                });
            });
        });

        // Clear localStorage and sessionStorage completely
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (error) {
            console.warn('Failed to clear storage:', error);
        }

        console.log('✅ Aggressive cookie clearing completed');
    }

    /**
     * Get diagnostic information for Cloudflare cookie issues
     */
    getCookieDiagnostics() {
        const allCookies = document.cookie.split(';').filter(c => c.trim());
        const cfCookies = allCookies.filter(c => c.includes('__cf_') || c.includes('cf_'));
        
        return {
            totalCookies: allCookies.length,
            cfCookies: cfCookies.length,
            cookieDetails: cfCookies.map(c => {
                const [name, ...rest] = c.split('=');
                return {
                    name: name.trim(),
                    value: rest.join('=').substring(0, 50) + '...',
                    domain: window.location.hostname
                };
            }),
            domainConfiguration: this.validateDomainConfiguration(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            cookieEnabled: navigator.cookieEnabled
        };
    }
}

// Export for use in other modules
export default CloudflareCookieFix;

// Auto-apply fix if we're in a browser environment and the error is detected
if (typeof window !== 'undefined') {
    (window as any).CloudflareCookieFix = CloudflareCookieFix;
    
    // Add global utility function
    (window as any).fixCloudflareCookies = () => {
        const fixer = new CloudflareCookieFix();
        return fixer.fixCloudflareCookies();
    };
    
    // Auto-detect and fix on page load if needed
    window.addEventListener('load', () => {
        // Check if we have recent cookie errors and auto-fix
        const hasRecentErrors = localStorage.getItem('cf_fix_last_error');
        if (hasRecentErrors) {
            console.log('🔧 Auto-applying Cloudflare cookie fix based on previous errors');
            const fixer = new CloudflareCookieFix();
            fixer.fixCloudflareCookies();
            localStorage.removeItem('cf_fix_last_error');
        }
    });
}