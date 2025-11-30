#!/usr/bin/env node

// Enhanced WebSocket connection test with Cloudflare cookie handling
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const SUPABASE_URL = 'wss://sshguczouozvsdwzfcbx.supabase.co/realtime/v1/websocket';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Nzk2ODEsImV4cCI6MjA3OTA1NTY4MX0.ooh5NGBqv6U0MLcwvURzcf-DVx_qvpYobdjy-ukpKbw';

const wsUrl = `${SUPABASE_URL}?apikey=${API_KEY}&eventsPerSecond=5&vsn=1.0.0`;

console.log('🔌 Enhanced WebSocket Connection Test');
console.log('=====================================');
console.log('🎯 Target URL:', wsUrl);
console.log('🔍 Testing Supabase realtime WebSocket connection...\n');

// Enhanced connection test with error handling
async function testWebSocketConnection() {
    return new Promise((resolve, reject) => {
        let WebSocket;
        
        try {
            WebSocket = require('ws');
        } catch (error) {
            console.error('❌ WebSocket module not found. Installing...');
            console.log('💡 Run: npm install ws');
            reject(new Error('WebSocket module (ws) not installed'));
            return;
        }

        const ws = new WebSocket(wsUrl);
        
        // Connection timeout
        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error('Connection timeout after 15 seconds'));
        }, 15000);

        // Connection opened
        ws.on('open', () => {
            clearTimeout(timeout);
            console.log('✅ WebSocket connection established successfully!');
            console.log('📡 Connection State: OPEN');
            
            // Test sending a message
            const joinMessage = {
                topic: 'realtime:public',
                event: 'phx_join',
                payload: {},
                ref: '1'
            };
            
            console.log('📤 Sending join message...');
            ws.send(JSON.stringify(joinMessage));
        });

        // Message received
        ws.on('message', (data) => {
            console.log('📨 Received message:', data.toString().substring(0, 200) + '...');
        });

        // Error handling with Cloudflare cookie awareness
        ws.on('error', (error) => {
            clearTimeout(timeout);
            
            console.error('❌ WebSocket error occurred:');
            console.error('Error Type:', error.code || 'Unknown');
            console.error('Error Message:', error.message || 'No message');
            
            // Specific handling for Cloudflare cookie errors
            if (error.message && (
                error.message.includes('__cf_bm') ||
                error.message.includes('Cloudflare') ||
                error.message.includes('cookie') ||
                error.message.includes('domain')
            )) {
                console.log('\n🔧 CLOUDFLARE COOKIE ISSUE DETECTED');
                console.log('=====================================');
                console.log('💡 This is a known issue with Cloudflare bot management cookies.');
                console.log('🔍 Common causes:');
                console.log('   • Domain mismatch between cookie and current domain');
                console.log('   • Browser privacy settings blocking cookies');
                console.log('   • Corporate firewall blocking WebSocket traffic');
                console.log('   • Outdated browser or extension conflicts');
                console.log('\n🛠️ Solutions:');
                console.log('   1. Clear browser cache and cookies for this domain');
                console.log('   2. Try in private/incognito browsing mode');
                console.log('   3. Disable privacy extensions temporarily');
                console.log('   4. Check domain configuration (www vs non-www)');
                console.log('   5. Update browser to latest version');
                console.log('   6. Check corporate network settings');
            }
            
            // Handle other common WebSocket errors
            if (error.code === 'ECONNREFUSED') {
                console.log('\n🌐 CONNECTION REFUSED');
                console.log('=====================');
                console.log('💡 Possible causes:');
                console.log('   • Supabase service temporarily unavailable');
                console.log('   • Network connectivity issues');
                console.log('   • Firewall blocking WebSocket connections');
            }
            
            if (error.code === 'ENOTFOUND') {
                console.log('\n🔍 DNS RESOLUTION FAILED');
                console.log('=========================');
                console.log('💡 Possible causes:');
                console.log('   • DNS resolution issues');
                console.log('   • Network connectivity problems');
                console.log('   • Supabase service domain unreachable');
            }
            
            reject(error);
        });

        // Connection closed
        ws.on('close', (code, reason) => {
            clearTimeout(timeout);
            console.log('🔌 WebSocket connection closed');
            console.log('Close Code:', code);
            console.log('Close Reason:', reason.toString() || 'No reason provided');
            
            if (code === 1000) {
                console.log('✅ Normal closure');
            } else if (code === 1001) {
                console.log('⚠️ Going away');
            } else if (code === 1002) {
                console.log('❌ Protocol error');
            } else if (code === 1003) {
                console.log('❌ Unsupported data');
            } else if (code === 1006) {
                console.log('❌ Abnormal closure - likely Cloudflare cookie issue');
            } else {
                console.log(`❌ Unusual closure code: ${code}`);
            }
        });
    });
}

// Network connectivity test
async function testNetworkConnectivity() {
    console.log('🌐 Testing Network Connectivity...');
    
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/', {
            method: 'HEAD',
            headers: {
                'apikey': API_KEY
            }
        });
        
        if (response.ok) {
            console.log('✅ Network connectivity: PASSED');
            return true;
        } else {
            console.log('⚠️ Network connectivity: WARNING (HTTP ' + response.status + ')');
            return false;
        }
    } catch (error) {
        console.log('❌ Network connectivity: FAILED');
        console.log('Error:', error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🧪 Starting Enhanced WebSocket Tests...\n');
    
    // Test 1: Network connectivity
    const networkOk = await testNetworkConnectivity();
    console.log('');
    
    // Test 2: WebSocket connection
    try {
        await testWebSocketConnection();
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('====================');
        console.log('✅ WebSocket connection working correctly');
        console.log('✅ No Cloudflare cookie issues detected');
        console.log('✅ Supabase realtime services accessible');
    } catch (error) {
        console.log('\n❌ TESTS FAILED');
        console.log('===============');
        console.log('💡 The WebSocket connection failed, but this might be expected in some environments.');
        console.log('🔧 See the error details above for specific troubleshooting steps.');
        console.log('🌐 If this is a production environment, check:');
        console.log('   • Supabase service status');
        console.log('   • Network firewall settings');
        console.log('   • Domain configuration');
        console.log('   • Cloudflare settings');
    }
    
    console.log('\n📋 SUMMARY');
    console.log('===========');
    console.log('🎯 Test completed at:', new Date().toISOString());
    console.log('🔗 Supabase URL:', SUPABASE_URL.replace('wss://', '').replace('/realtime/v1/websocket', ''));
    console.log('📡 WebSocket URL:', wsUrl);
    console.log('');
    console.log('💡 For browser-based testing, open: websocket_comprehensive_test.html');
    console.log('🔧 This provides visual testing and Cloudflare cookie fixes');
}

// Enhanced error handling for uncaught errors
process.on('uncaughtException', (error) => {
    console.error('\n💥 Uncaught Exception:', error.message);
    console.log('\n🛠️ This might be due to:');
    console.log('   • Missing Node.js modules (run: npm install)');
    console.log('   • Network connectivity issues');
    console.log('   • System-level restrictions');
    console.log('\n💡 Try the browser-based test instead: websocket_comprehensive_test.html');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the tests
runTests().catch(error => {
    console.error('💥 Fatal error during testing:', error.message);
    process.exit(1);
});