#!/usr/bin/env node

/**
 * Supabase Content Tables Fix
 * This script applies the missing content tables migration to fix 404 errors
 * 
 * Usage: node apply_content_tables_fix.js
 */

// Try to import dependencies, fall back to different methods if needed
let createClient;
try {
    createClient = require('@supabase/supabase-js').createClient;
} catch (error) {
    console.error('❌ @supabase/supabase-js not found. Please install it:');
    console.error('   npm install @supabase/supabase-js');
    process.exit(1);
}

try {
    require('dotenv').config();
} catch (error) {
    console.error('❌ dotenv not found. Please install it:');
    console.error('   npm install dotenv');
    process.exit(1);
}

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sshguczouozvsdwzfcbx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in your .env file');
    console.error('📋 Get it from: https://supabase.com/dashboard → Settings → API → service_role secret');
    process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkTableExists(tableName) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
            .limit(1);
            
        if (error) {
            console.log(`❌ Table ${tableName} does not exist:`, error.message);
            return false;
        }
        console.log(`✅ Table ${tableName} exists`);
        return true;
    } catch (err) {
        console.log(`❌ Table ${tableName} does not exist:`, err.message);
        return false;
    }
}

async function runSQLCommand(sql) {
    try {
        // Use Supabase's RPC function to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', { query: sql });
        
        if (error) {
            // Try alternative approach with direct table creation if RPC doesn't exist
            console.log('ℹ️  RPC exec_sql not available, trying direct approach...');
            throw error;
        }
        
        return { success: true, data };
    } catch (error) {
        console.log('ℹ️  Using alternative SQL execution method...');
        // For now, just return success to indicate we should apply the SQL manually
        return { success: false, error, needsManual: true };
    }
}

async function applyContentTablesFix() {
    console.log('🔧 Starting Supabase Content Tables Fix...\n');
    
    // Check which tables are missing
    const requiredTables = ['content_locks', 'content_analytics', 'content_revisions'];
    const existingTables = [];
    const missingTables = [];
    
    console.log('📋 Checking existing tables...');
    for (const table of requiredTables) {
        const exists = await checkTableExists(table);
        if (exists) {
            existingTables.push(table);
        } else {
            missingTables.push(table);
        }
    }
    
    console.log(`\n📊 Table Status:`);
    console.log(`   ✅ Existing: ${existingTables.length}/3`);
    console.log(`   ❌ Missing: ${missingTables.length}/3`);
    
    if (missingTables.length === 0) {
        console.log('\n✅ All required tables already exist! No fixes needed.');
        return;
    }
    
    console.log(`\n🔧 Applying fix for missing tables: ${missingTables.join(', ')}`);
    
    // Read and execute the SQL fix
    const fs = require('fs');
    const path = require('path');
    
    try {
        const sqlFilePath = path.join(__dirname, 'create_missing_content_tables.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        console.log('\n📄 Executing SQL migration...');
        
        // Try to execute the SQL
        const result = await runSQLCommand(sqlContent);
        
        if (result.success) {
            console.log('✅ SQL migration executed successfully via RPC!');
        } else {
            console.log('⚠️  Cannot execute SQL via API. Manual execution required.\n');
            console.log('📋 MANUAL INSTRUCTIONS:');
            console.log('   1. Go to your Supabase Dashboard');
            console.log('   2. Navigate to SQL Editor');
            console.log('   3. Copy the content of create_missing_content_tables.sql');
            console.log('   4. Paste and run the SQL in the SQL Editor');
            console.log('   5. This will create the missing tables and fix 404 errors\n');
        }
        
    } catch (error) {
        console.error('❌ Error reading SQL file:', error.message);
        console.log('\n📋 MANUAL INSTRUCTIONS:');
        console.log('   Please run the SQL commands in create_missing_content_tables.sql manually');
        console.log('   in your Supabase SQL Editor to create the missing tables.');
    }
    
    // Verify the fix
    console.log('\n🔍 Verifying tables after fix...');
    let allCreated = true;
    
    for (const table of requiredTables) {
        const exists = await checkTableExists(table);
        if (!exists) {
            allCreated = false;
        }
    }
    
    if (allCreated) {
        console.log('\n🎉 SUCCESS! All content tables are now available.');
        console.log('   The 404 errors should be resolved.');
        console.log('\n📋 Available features:');
        console.log('   - Content locking for collaborative editing');
        console.log('   - Content analytics tracking');
        console.log('   - Content revision history');
    } else {
        console.log('\n⚠️  Some tables are still missing. Please run the SQL manually.');
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Run the fix
if (require.main === module) {
    applyContentTablesFix()
        .then(() => {
            console.log('\n✨ Fix process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Fix process failed:', error);
            process.exit(1);
        });
}

module.exports = { applyContentTablesFix };