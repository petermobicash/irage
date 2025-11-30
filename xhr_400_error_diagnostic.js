// XHR 400 Error Diagnostic Script
// Tests the failing query and analyzes the database structure

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://sshguczouozvsdwzfcbx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key_here';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseXHR400Error() {
    console.log('🔍 XHR 400 Error Diagnostic for user_profiles');
    console.log('=============================================\n');

    try {
        // Test 1: Check if user_profiles table exists and its structure
        console.log('📊 Step 1: Checking user_profiles table structure...');
        try {
            const { data: schema, error: schemaError } = await supabase
                .from('user_profiles')
                .select('*')
                .limit(0);

            if (schemaError) {
                console.error('❌ Schema Error:', schemaError.message);
            } else {
                console.log('✅ user_profiles table exists and accessible');
            }
        } catch (err) {
            console.error('❌ Table Access Error:', err.message);
        }

        // Test 2: Get table column information
        console.log('\n📋 Step 2: Getting column information...');
        try {
            const { data: columns, error: columnsError } = await supabase
                .rpc('get_table_columns', { table_name: 'user_profiles' })
                .select('*');

            if (columnsError) {
                console.log('ℹ️  Using alternative method to get schema...');
                
                // Alternative approach: Try to select specific columns
                const testColumns = ['id', 'user_id', 'username', 'display_name', 'status'];
                for (const column of testColumns) {
                    try {
                        const { data, error } = await supabase
                            .from('user_profiles')
                            .select(column)
                            .limit(1);
                        
                        if (error) {
                            console.log(`❌ Column '${column}': ${error.message}`);
                        } else {
                            console.log(`✅ Column '${column}': Accessible`);
                        }
                    } catch (err) {
                        console.log(`❌ Column '${column}': ${err.message}`);
                    }
                }
            } else {
                console.log('✅ Column information retrieved:', columns);
            }
        } catch (err) {
            console.log('ℹ️  Column info error:', err.message);
        }

        // Test 3: Test the problematic query
        console.log('\n🚨 Step 3: Testing the failing query...');
        console.log('Query: user_profiles?select=user_id&id=eq.new');
        
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('user_id')
                .eq('id', 'new');

            if (error) {
                console.log('❌ Query Error (Expected):', error.message);
                console.log('   Error Code:', error.code || 'N/A');
                console.log('   Details:', error.details || 'N/A');
                
                if (error.message.includes('invalid input syntax for type uuid')) {
                    console.log('   💡 DIAGNOSIS: The "id" field expects a UUID, but "new" is not a valid UUID');
                } else if (error.message.includes('relation user_profiles does not exist')) {
                    console.log('   💡 DIAGNOSIS: The user_profiles table does not exist');
                } else if (error.message.includes('permission denied')) {
                    console.log('   💡 DIAGNOSIS: RLS policies are blocking access');
                }
            } else {
                console.log('✅ Query succeeded:', data);
            }
        } catch (err) {
            console.log('❌ Query Exception:', err.message);
        }

        // Test 4: Test alternative query approaches
        console.log('\n🔄 Step 4: Testing alternative queries...');

        // Test: Query with valid UUID (if any profiles exist)
        try {
            const { data: allProfiles, error: fetchError } = await supabase
                .from('user_profiles')
                .select('id, user_id')
                .limit(1);

            if (fetchError) {
                console.log('❌ Cannot fetch profiles:', fetchError.message);
            } else if (allProfiles && allProfiles.length > 0) {
                const profile = allProfiles[0];
                console.log(`🔍 Testing with real UUID: ${profile.id}`);
                
                const { data: validData, error: validError } = await supabase
                    .from('user_profiles')
                    .select('user_id')
                    .eq('id', profile.id);

                if (validError) {
                    console.log('❌ Valid UUID query failed:', validError.message);
                } else {
                    console.log('✅ Valid UUID query succeeded:', validData);
                }
            } else {
                console.log('ℹ️  No profiles found to test with');
            }
        } catch (err) {
            console.log('❌ Profile test error:', err.message);
        }

        // Test: Query by username or other fields
        console.log('\n🔍 Testing alternative filtering approaches...');
        
        const alternativeFilters = ['username', 'user_id', 'status'];
        for (const field of alternativeFilters) {
            try {
                if (field === 'status') {
                    const { data, error } = await supabase
                        .from('user_profiles')
                        .select('user_id')
                        .eq(field, 'new');
                    
                    console.log(`Filter by ${field}='new':`, 
                        error ? `❌ ${error.message}` : `✅ ${data?.length || 0} results`);
                } else {
                    console.log(`Filter by ${field}='new': Skipped (UUID field)`);
                }
            } catch (err) {
                console.log(`Filter by ${field}='new': ❌ ${err.message}`);
            }
        }

        // Test 5: Check if there's a special "new" user concept
        console.log('\n💡 Step 5: Checking for "new" user patterns...');
        
        try {
            // Check if there are any records with status='new' or similar
            const { data: statusData, error: statusError } = await supabase
                .from('user_profiles')
                .select('id, user_id, username, status')
                .eq('status', 'new')
                .limit(5);

            if (statusError) {
                console.log('❌ Status check failed:', statusError.message);
            } else if (statusData && statusData.length > 0) {
                console.log('✅ Found profiles with status="new":', statusData.length);
                console.log('   Sample:', statusData[0]);
            } else {
                console.log('ℹ️  No profiles found with status="new"');
            }
        } catch (err) {
            console.log('❌ Status check error:', err.message);
        }

        // Test 6: Summary and recommendations
        console.log('\n📋 SUMMARY AND RECOMMENDATIONS');
        console.log('==============================');
        console.log(`
The XHR 400 error occurs because:
1. The query tries to filter id=eq.new
2. The "id" field is a UUID type that expects format: 123e4567-e89b-12d3-a456-426614174000
3. "new" is not a valid UUID format

Possible solutions:
1. If looking for a "new" user status: Use ?status=eq.new instead of ?id=eq.new
2. If looking for user creation: Query by user_id with actual UUID
3. If filtering by username: Use ?username=eq.new
4. Check the calling code to understand the intended behavior

The correct query depends on what "new" represents in your application context.
        `);

    } catch (err) {
        console.error('❌ Diagnostic error:', err.message);
    }
}

// Run the diagnostic
diagnoseXHR400Error()
    .then(() => console.log('\n✅ Diagnostic completed'))
    .catch(err => console.error('❌ Diagnostic failed:', err));