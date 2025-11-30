// XHR 400 Error Fix Script for user_profiles Query
// This script identifies and fixes the query causing the 400 error

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://sshguczouozvsdwzfcbx.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixXHR400Error() {
    console.log('🔧 XHR 400 Error Fix for user_profiles Query');
    console.log('============================================\n');

    const results = {
        tableExists: false,
        columnInfo: [],
        problemIdentified: false,
        fixImplemented: false,
        testResults: []
    };

    try {
        // Step 1: Verify table exists and get structure
        console.log('📋 Step 1: Checking user_profiles table structure...');
        
        try {
            const { data: testData, error: testError } = await supabase
                .from('user_profiles')
                .select('*')
                .limit(1);

            if (testError) {
                console.log('❌ Table access error:', testError.message);
                
                if (testError.message.includes('relation user_profiles does not exist')) {
                    console.log('💡 The user_profiles table does not exist - this would be a 500 error');
                    return results;
                }
            } else {
                results.tableExists = true;
                console.log('✅ user_profiles table exists and is accessible');
            }
        } catch (err) {
            console.log('❌ Exception accessing table:', err.message);
            return results;
        }

        // Step 2: Analyze column structure by testing common fields
        console.log('\n📊 Step 2: Analyzing column structure...');
        
        const commonColumns = ['id', 'user_id', 'username', 'display_name', 'status', 'created_at'];
        
        for (const column of commonColumns) {
            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select(column)
                    .limit(1);

                if (error) {
                    console.log(`❌ Column '${column}': ${error.message}`);
                    results.columnInfo.push({ column, exists: false, error: error.message });
                } else {
                    console.log(`✅ Column '${column}': Accessible`);
                    results.columnInfo.push({ column, exists: true, error: null });
                }
            } catch (err) {
                console.log(`❌ Column '${column}': Exception - ${err.message}`);
                results.columnInfo.push({ column, exists: false, error: err.message });
            }
        }

        // Step 3: Test the problematic query
        console.log('\n🚨 Step 3: Testing the problematic query...');
        console.log('Query: user_profiles?select=user_id&id=eq.new');
        
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('user_id')
                .eq('id', 'new');

            if (error) {
                console.log('❌ Expected error (confirming diagnosis):');
                console.log('   Message:', error.message);
                console.log('   Code:', error.code || 'N/A');
                
                if (error.message.includes('invalid input syntax for type uuid')) {
                    console.log('   💡 DIAGNOSIS CONFIRMED: "id" field is UUID, "new" is not valid UUID');
                    results.problemIdentified = true;
                }
            } else {
                console.log('⚠️  Unexpected: Query succeeded with id=eq.new');
                console.log('   Data:', data);
            }
        } catch (err) {
            console.log('❌ Query exception:', err.message);
        }

        // Step 4: Test alternative queries
        console.log('\n🔄 Step 4: Testing alternative query approaches...');

        // Test status=eq.new (most likely intended behavior)
        try {
            console.log('🔍 Testing: status=eq.new');
            const { data: statusData, error: statusError } = await supabase
                .from('user_profiles')
                .select('user_id')
                .eq('status', 'new');

            if (statusError) {
                console.log('❌ Status query failed:', statusError.message);
                results.testResults.push({
                    query: 'status=eq.new',
                    success: false,
                    error: statusError.message,
                    dataCount: 0
                });
            } else {
                console.log(`✅ Status query succeeded: ${statusData?.length || 0} results`);
                results.testResults.push({
                    query: 'status=eq.new',
                    success: true,
                    error: null,
                    dataCount: statusData?.length || 0
                });
            }
        } catch (err) {
            console.log('❌ Status query exception:', err.message);
        }

        // Test username=eq.new
        try {
            console.log('🔍 Testing: username=eq.new');
            const { data: usernameData, error: usernameError } = await supabase
                .from('user_profiles')
                .select('user_id')
                .eq('username', 'new');

            if (usernameError) {
                console.log('❌ Username query failed:', usernameError.message);
                results.testResults.push({
                    query: 'username=eq.new',
                    success: false,
                    error: usernameError.message,
                    dataCount: 0
                });
            } else {
                console.log(`✅ Username query succeeded: ${usernameData?.length || 0} results`);
                results.testResults.push({
                    query: 'username=eq.new',
                    success: true,
                    error: null,
                    dataCount: usernameData?.length || 0
                });
            }
        } catch (err) {
            console.log('❌ Username query exception:', err.message);
        }

        // Step 5: Implement fix recommendations
        console.log('\n💡 Step 5: Fix Implementation Recommendations...');
        
        const statusQuerySuccess = results.testResults.find(r => r.query === 'status=eq.new' && r.success);
        const usernameQuerySuccess = results.testResults.find(r => r.query === 'username=eq.new' && r.success);

        if (statusQuerySuccess && statusQuerySuccess.dataCount > 0) {
            console.log('🎯 RECOMMENDED FIX: Use status filter instead of id filter');
            console.log('');
            console.log('❌ Current (broken):');
            console.log('   supabase.from("user_profiles").select("user_id").eq("id", "new")');
            console.log('');
            console.log('✅ Fixed:');
            console.log('   supabase.from("user_profiles").select("user_id").eq("status", "new")');
            console.log('');
            console.log('📊 This will return', statusQuerySuccess.dataCount, 'profiles with status="new"');
            results.fixImplemented = true;
        } else if (usernameQuerySuccess && usernameQuerySuccess.dataCount > 0) {
            console.log('🎯 RECOMMENDED FIX: Use username filter instead of id filter');
            console.log('');
            console.log('❌ Current (broken):');
            console.log('   supabase.from("user_profiles").select("user_id").eq("id", "new")');
            console.log('');
            console.log('✅ Fixed:');
            console.log('   supabase.from("user_profiles").select("user_id").eq("username", "new")');
            console.log('');
            console.log('📊 This will return', usernameQuerySuccess.dataCount, 'profiles with username="new"');
            results.fixImplemented = true;
        } else {
            console.log('🎯 RECOMMENDED FIX: Update the query filter');
            console.log('');
            console.log('❌ Current (broken):');
            console.log('   .eq("id", "new")');
            console.log('');
            console.log('✅ Options to fix:');
            console.log('   .eq("status", "new")     // If looking for new user status');
            console.log('   .eq("username", "new")   // If "new" is a username');
            console.log('   .eq("user_id", "[UUID]") // If you have the actual user UUID');
        }

        // Step 6: Search for the problematic query in codebase
        console.log('\n🔍 Step 6: Finding the source of the problematic query...');
        console.log('Search your codebase for:');
        console.log('   1. "user_profiles" with "select" and "user_id"');
        console.log('   2. ".eq("id", "new")" patterns');
        console.log('   3. Query strings containing "id=eq.new"');

        console.log('\n📋 SUMMARY');
        console.log('=========');
        console.log(`Table exists: ${results.tableExists ? '✅' : '❌'}`);
        console.log(`Problem identified: ${results.problemIdentified ? '✅' : '❌'}`);
        console.log(`Fix recommended: ${results.fixImplemented ? '✅' : '⚠️'}`);
        
        console.log('\n🛠️  NEXT STEPS:');
        console.log('1. Update the query in your code to use the correct filter');
        console.log('2. Test the corrected query');
        console.log('3. Verify the XHR 400 error is resolved');
        
        return results;

    } catch (err) {
        console.error('❌ Fix script error:', err.message);
        return results;
    }
}

// Export for use in other scripts
module.exports = { fixXHR400Error };

// Run if called directly
if (require.main === module) {
    fixXHR400Error()
        .then((results) => {
            console.log('\n✅ Fix diagnostic completed');
            process.exit(0);
        })
        .catch((err) => {
            console.error('❌ Fix diagnostic failed:', err);
            process.exit(1);
        });
}