#!/usr/bin/env node

/**
 * Environment Diagnostic Script
 * Checks if environment variables are loaded correctly
 */

console.log('🔍 Environment Variable Diagnostic');
console.log('==================================');

// Check if we're in Node.js environment
if (typeof process !== 'undefined') {
  console.log('✅ Running in Node.js environment');
} else {
  console.log('❌ Not running in Node.js environment');
}

console.log('\n📋 Environment Variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || '❌ NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');

if (process.env.VITE_SUPABASE_URL) {
  try {
    const url = new URL(process.env.VITE_SUPABASE_URL);
    console.log('\n🔍 URL Analysis:');
    console.log('Protocol:', url.protocol);
    console.log('Hostname:', url.hostname);
    console.log('Port:', url.port || 'default');
    console.log('Path:', url.pathname);
    
    if (url.hostname.includes('dummy')) {
      console.log('❌ ERROR: Supabase URL contains "dummy" - this will cause CSP violations!');
    } else if (url.hostname.includes('supabase')) {
      console.log('✅ Valid Supabase URL detected');
    } else {
      console.log('⚠️ WARNING: URL does not look like a standard Supabase URL');
    }
  } catch (error) {
    console.log('❌ ERROR: Invalid URL format:', error.message);
  }
} else {
  console.log('\n❌ ERROR: VITE_SUPABASE_URL is not set!');
  console.log('This will cause the Supabase client to use fallback URLs.');
}

console.log('\n🛠️ Solution Steps:');
console.log('1. Check your .env file has: VITE_SUPABASE_URL=https://sshguczouozvsdwzfcbx.supabase.co');
console.log('2. Ensure the environment variable is loaded in your build process');
console.log('3. Check Netlify/Vercel environment variables are set correctly');
console.log('4. Clear browser cache and rebuild the application');

console.log('\n💡 Additional Checks:');
console.log('- Node version:', process.version);
console.log('- Platform:', process.platform);
console.log('- Working directory:', process.cwd());