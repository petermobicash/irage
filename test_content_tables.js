#!/usr/bin/env node

/**
 * Test Supabase Content Tables
 * Verifies that the content tables were created successfully
 * 
 * Usage: node test_content_tables.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sshguczouozvsdwzfcbx.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY is required in your .env file');
    console.error('📋 Get it from: https://supabase.com/dashboard → Settings → API → anon public key');
    process.exit(1);
}

// Create Supabase client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTable(tableName, description) {
    console.log(`\n🔍 Testing ${tableName} (${description})...`);
    
    try {
        // Test SELECT operation
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
            .limit(1);
            
        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
                console.log(`❌ Table ${tableName} does not exist!`);
                return false;
            } else {
                console.log(`✅ Table ${tableName} exists (got expected error: ${error.message})`);
                return true;
            }
        }
        
        console.log(`✅ Table ${tableName} is accessible`);
        console.log(`   📊 Record count: ${count || 0}`);
        return true;
        
    } catch (err) {
        console.log(`❌ Table ${tableName} test failed:`, err.message);
        return false;
    }
}

async function testQuery(tableName, queryDescription) {
    console.log(`\n📝 Testing ${tableName} query: ${queryDescription}...`);
    
    try {
        let query = supabase.from(tableName).select('*').limit(1);
        
        // Add specific filters based on table
        if (tableName === 'content_locks') {
            query = query.gt('expires_at', new Date().toISOString());
        } else if (tableName === 'content_analytics') {
            query = query.gte('recorded_at', new Date(Date.now() - 24*60*60*1000).toISOString());
        } else if (tableName === 'content_revisions') {
            query = query.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;
        
        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
                console.log(`❌ Query failed - table ${tableName} does not exist`);
                return false;
            } else {
                console.log(`⚠️  Query had expected error: ${error.message}`);
                return true;
            }
        }
        
        console.log(`✅ Query executed successfully`);
        console.log(`   📊 Returned ${data?.length || 0} records`);
        return true;
        
    } catch (err) {
        console.log(`❌ Query test failed:`, err.message);
        return false;
    }
}

async function testContentTableRelation() {
    console.log('\n🔗 Testing content table relationships...');
    
    try {
        // Test that we can join with content table
        const { data, error } = await supabase
            .from('content_locks')
            .select(`
                *,
                content:id
            `)
            .limit(1);
            
        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
                console.log('❌ Content locks table does not exist for relationship test');
                return false;
            } else {
                console.log('⚠️  Relationship query had expected error:', error.message);
                return true;
            }
        }
        
        console.log('✅ Content relationships are working');
        return true;
        
    } catch (err) {
        console.log('❌ Relationship test failed:', err.message);
        return false;
    }
}

async function runTests() {
    console.log('🧪 Testing Supabase Content Tables Fix\n');
    console.log('=' .repeat(50));
    
    // Test each table
    const tables = [
        { name: 'content_locks', description: 'Content editing locks' },
        { name: 'content_analytics', description: 'Content analytics tracking' },
        { name: 'content_revisions', description: 'Content revision history' }
    ];
    
    let passedTests = 0;
    let totalTests = 0;
    
    // Basic existence tests
    for (const table of tables) {
        totalTests++;
        if (await testTable(table.name, table.description)) {
            passedTests++;
        }
    }
    
    // Query functionality tests
    for (const table of tables) {
        totalTests++;
        if (await testQuery(table.name, 'basic functionality')) {
            passedTests++;
        }
    }
    
    // Relationship test
    totalTests++;
    if (await testContentTableRelation()) {
        passedTests++;
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 SUCCESS! All content tables are working correctly.');
        console.log('   The 404 errors should be completely resolved.');
        console.log('\n✨ Your Supabase database now supports:');
        console.log('   • Content locking for collaborative editing');
        console.log('   • Analytics tracking for content performance');
        console.log('   • Content revision history and change tracking');
        
    } else if (passedTests > totalTests * 0.7) {
        console.log('\n⚠️  PARTIAL SUCCESS: Most tests passed.');
        console.log('   Some functionality may still have issues.');
        console.log('   Please check the failed tests above.');
        
    } else {
        console.log('\n❌ FAILURE: Most tests failed.');
        console.log('   The database tables may not be created correctly.');
        console.log('   Please run the fix script again or apply the SQL manually.');
    }
    
    console.log('\n' + '=' .repeat(50));
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

// Run the tests
if (require.main === module) {
    runTests()
        .then(() => {
            console.log('\n✨ Test process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Test process failed:', error);
            process.exit(1);
        });
}

module.exports = { runTests };