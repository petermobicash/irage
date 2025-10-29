#!/usr/bin/env node

/**
 * Debug environment variables
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Environment Variables Debug');
console.log('================================');

// Check if .env file exists and can be loaded
try {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  console.log('✅ .env file loaded successfully');
  
  // Parse and set environment variables
  const envVars = {};
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
      envVars[key.trim()] = value.trim();
    }
  });
  
  // Set the environment variables
  Object.keys(envVars).forEach(key => {
    process.env[key] = envVars[key];
  });
  
  console.log('✅ Environment variables parsed and set');
} catch (error) {
  console.log('❌ Error loading .env file:', error.message);
}

console.log('');
console.log('📋 Environment Variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || '❌ NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ NOT SET');

console.log('');
console.log('🔍 Debugging Info:');
console.log('Current working directory:', process.cwd());
console.log('Node.js version:', process.version);

if (process.env.VITE_SUPABASE_URL) {
  try {
    const url = new URL(process.env.VITE_SUPABASE_URL);
    console.log('Parsed hostname:', url.hostname);
    console.log('Is localhost?:', ['localhost', '127.0.0.1'].includes(url.hostname));
  } catch (error) {
    console.log('❌ Invalid URL format:', error.message);
  }
}