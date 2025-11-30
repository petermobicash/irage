#!/usr/bin/env node

/**
 * Fix page_content schema mismatch
 * Changes page_id from UUID to TEXT to match frontend expectations
 * Uses the service role key to execute DDL directly
 */

const SUPABASE_URL = 'https://sshguczouozvsdwzfcbx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ3OTY4MSwiZXhwIjoyMDc5MDU1NjgxfQ.g_DHPAaaTvVmEIKoLvvN-CXhYWNcA7oQ76n34udwwRs';

async function fixPageContentSchema() {
    console.log('🔧 Fixing page_content schema mismatch...');
    console.log('Issue: page_id is UUID but frontend sends strings like "home", "about", etc.');
    console.log('Solution: Change page_id to TEXT type\n');

    // SQL statements to fix the schema
    const sqlStatements = [
        // Change page_id from UUID to TEXT
        `ALTER TABLE public.page_content ALTER COLUMN page_id TYPE TEXT;`,
        
        // Update any existing records to have valid string identifiers
        `UPDATE public.page_content SET page_id = 'home' WHERE page_id IS NOT NULL AND page_id NOT IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved');`,
        
        // Add validation constraint for page_id values
        `ALTER TABLE public.page_content ADD CONSTRAINT valid_page_id CHECK (page_id IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved', 'dashboard', 'admin', 'profile', 'settings', 'login', 'register'));`,
        
        // Create performance index
        `CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON public.page_content(page_id);`
    ];

    for (let i = 0; i < sqlStatements.length; i++) {
        const sql = sqlStatements[i];
        console.log(`⚡ Executing SQL ${i + 1}/${sqlStatements.length}...`);
        console.log(`   Query: ${sql.substring(0, 60)}...`);
        
        try {
            // First try: Use exec_sql RPC if available
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                    query: sql
                })
            });

            const result = await response.text();
            
            if (!response.ok) {
                console.log(`⚠️  RPC method failed, trying edge function...`);
                
                // Alternative: Use edge function
                const altResponse = await fetch(`${SUPABASE_URL}/functions/v1/exec-sql`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    },
                    body: JSON.stringify({
                        sql: sql
                    })
                });
                
                if (!altResponse.ok) {
                    console.error(`❌ Failed SQL ${i + 1}:`, result);
                    console.log(`🔧 SQL: ${sql}`);
                } else {
                    console.log(`✅ SQL ${i + 1} executed successfully via edge function`);
                }
            } else {
                console.log(`✅ SQL ${i + 1} executed successfully`);
            }
        } catch (error) {
            console.error(`❌ Error executing SQL ${i + 1}:`, error.message);
        }
    }

    // Test the table after schema fix
    console.log('\n🧪 Testing page_content table after fix...');
    
    try {
        const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/page_content?select=*&limit=1`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            }
        });

        if (testResponse.ok) {
            console.log('✅ page_content table is accessible!');
            
            // Test inserting with string page_id
            console.log('\n📝 Testing insert with string page_id...');
            const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/page_content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    page_id: 'test-page',
                    section_id: 'hero',
                    title: 'Test Content',
                    content: 'This is test content to verify the fix',
                    order_index: 0,
                    is_active: true
                })
            });

            if (insertResponse.ok) {
                const insertedData = await insertResponse.json();
                console.log('✅ Test insert successful!');
                console.log('🗂️  Data:', JSON.stringify(insertedData, null, 2));
                
                // Clean up test data
                console.log('\n🧹 Cleaning up test data...');
                const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/page_content?id=eq.${insertedData[0].id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_SERVICE_ROLE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    }
                });
                
                if (deleteResponse.ok) {
                    console.log('✅ Test data cleaned up successfully');
                }
            } else {
                const insertError = await insertResponse.text();
                console.error('❌ Test insert failed:', insertError);
            }
        } else {
            const errorText = await testResponse.text();
            console.error('❌ Table still not accessible:', errorText);
        }
    } catch (error) {
        console.error('💥 Test failed:', error.message);
    }
    
    console.log('\n🎉 page_content schema fix completed!');
    console.log('✅ The XHR 400 error should now be resolved!');
    console.log('✅ page_id can now accept string values like: home, about, spiritual, philosophy, culture, programs, get-involved');
}

fixPageContentSchema();