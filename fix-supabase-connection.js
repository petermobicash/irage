#!/usr/bin/env node

/**
 * Fix Supabase Database Connection Issue
 * 
 * This script resolves the hostname resolution error by:
 * 1. Checking current Supabase configuration
 * 2. Identifying conflicting configurations
 * 3. Providing step-by-step fixes
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 SUPABASE CONNECTION FIX');
console.log('===========================');

// Check for .env file
const envPath = join(__dirname, '.env');
if (!existsSync(envPath)) {
  console.log('❌ .env file not found! Creating one...');
  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin API Configuration
ADMIN_API_KEY=benirage-admin-2024

# Server Configuration
PORT=3001
`;
  writeFileSync(envPath, envContent);
  console.log('✅ .env file created. Please update with your actual Supabase credentials.');
  process.exit(1);
}

// Load environment variables
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    envVars[key.trim()] = value.trim();
  }
});

// Check for problematic webBenirage directory
const webBenirageConfig = join(__dirname, 'webBenirage', 'supabase', 'config.toml');
console.log('\n📁 Checking for conflicting configurations...');

if (existsSync(webBenirageConfig)) {
  console.log('⚠️  CONFLICT DETECTED!');
  console.log('   Found webBenirage/supabase/config.toml with project_id that causes hostname issues');
  
  // Read the problematic config
  const configContent = readFileSync(webBenirageConfig, 'utf8');
  const projectIdMatch = configContent.match(/project_id\s*=\s*"([^"]+)"/);
  
  if (projectIdMatch) {
    const projectId = projectIdMatch[1];
    console.log(`   Project ID: ${projectId}`);
    console.log(`   This creates hostname: supabase_db_${projectId}`);
    console.log(`   Which resolves to: supabase_db_${projectId} (❌ Invalid!)`);
    
    console.log('\n💡 SOLUTION OPTIONS:');
    console.log('====================');
    console.log('Option 1: Remove webBenirage directory (recommended)');
    console.log('   rm -rf webBenirage/');
    console.log('');
    console.log('Option 2: Use the webBenirage version instead');
    console.log('   cd webBenirage && npm install && npm run dev');
    console.log('');
    console.log('Option 3: Fix the project ID in webBenirage');
    console.log('   Edit webBenirage/supabase/config.toml and change project_id to "local"');
  }
} else {
  console.log('✅ No conflicting configurations found');
}

// Check current environment
console.log('\n📋 CURRENT CONFIGURATION:');
console.log('==========================');
console.log('VITE_SUPABASE_URL:', envVars.VITE_SUPABASE_URL || '❌ NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', envVars.VITE_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', envVars.SUPABASE_SERVICE_ROLE_KEY ? '✅ SET' : '❌ NOT SET');

if (envVars.VITE_SUPABASE_URL) {
  try {
    const url = new URL(envVars.VITE_SUPABASE_URL);
    console.log('\n🔍 URL Analysis:');
    console.log('   Hostname:', url.hostname);
    console.log('   Port:', url.port || '80');
    console.log('   Protocol:', url.protocol);
    console.log('   Is localhost?:', ['localhost', '127.0.0.1'].includes(url.hostname) ? '✅ YES' : '❌ NO');
  } catch (error) {
    console.log('\n❌ Invalid URL format:', error.message);
  }
}

console.log('\n🚀 RECOMMENDED ACTIONS:');
console.log('========================');

// Check if we're in the right directory
const currentDir = __dirname;
const hasSrcDir = existsSync(join(currentDir, 'src'));
const hasWebBenirageDir = existsSync(join(currentDir, 'webBenirage'));

if (hasSrcDir && hasWebBenirageDir) {
  console.log('⚠️  Multiple project versions detected!');
  console.log('   You have both main project and webBenirage subdirectory.');
  console.log('');
  console.log('📌 RECOMMENDED: Use the main directory for development:');
  console.log('   npm install');
  console.log('   npm run dev');
  console.log('');
  console.log('🗑️  OPTIONAL: Clean up webBenirage directory:');
  console.log('   rm -rf webBenirage/');
} else if (hasSrcDir) {
  console.log('✅ Using main project directory');
  console.log('');
  console.log('📦 NEXT STEPS:');
  console.log('   1. Update .env file with your actual Supabase credentials');
  console.log('   2. npm install');
  console.log('   3. npm run dev');
} else if (hasWebBenirageDir) {
  console.log('⚠️  Using webBenirage subdirectory');
  console.log('');
  console.log('📦 RECOMMENDED: Switch to main directory:');
  console.log('   cd .. && npm install && npm run dev');
}

console.log('\n🛠️  SUPABASE SETUP (if needed):');
console.log('================================');
console.log('If you need to set up local Supabase:');
console.log('1. npm install -g supabase');
console.log('2. supabase init');
console.log('3. supabase start');
console.log('4. supabase status  # Check if running on port 54321');

console.log('\n🔧 TROUBLESHOOTING:');
console.log('===================');
console.log('If you still get connection errors:');
console.log('1. Check if Supabase is running: supabase status');
console.log('2. Verify port 54321 is free: lsof -i :54321');
console.log('3. Restart Supabase: supabase stop && supabase start');
console.log('4. Check firewall/network settings');

console.log('\n✅ Fix completed! Follow the recommended actions above.');