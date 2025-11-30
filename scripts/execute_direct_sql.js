#!/usr/bin/env node

/**
 * Direct SQL execution for automation_rules table creation
 * Uses the service role key to execute DDL directly
 */

const SUPABASE_URL = 'https://sshguczouozvsdwzfcbx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ3OTY4MSwiZXhwIjoyMDc5MDU1NjgxfQ.g_DHPAaaTvVmEIKoLvvN-CXhYWNcA7oQ76n34udwwRs';

async function executeDirectSQL() {
    console.log('🚀 Executing direct SQL to create automation_rules table...');

    // SQL to create the table
    const sqlStatements = [
        `CREATE TABLE IF NOT EXISTS public.automation_rules (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            rule_type VARCHAR(50) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            trigger_conditions JSONB,
            actions JSONB,
            schedule_config JSONB,
            created_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_run_at TIMESTAMP WITH TIME ZONE,
            run_count INTEGER DEFAULT 0,
            organization_id UUID REFERENCES organizations(id)
        );`,

        `CREATE INDEX IF NOT EXISTS idx_automation_rules_created_at ON public.automation_rules(created_at DESC);`,

        `ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;`
    ];

    for (let i = 0; i < sqlStatements.length; i++) {
        const sql = sqlStatements[i];
        console.log(`⚡ Executing SQL ${i + 1}/${sqlStatements.length}...`);
        
        try {
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
                console.log(`⚠️  Attempting alternative method for SQL ${i + 1}...`);
                
                // Alternative: Use psql through edge function
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

    // Test the table creation
    console.log('\n🧪 Testing automation_rules table...');
    
    try {
        const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/automation_rules?select=*&limit=1`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            }
        });

        if (testResponse.ok) {
            console.log('✅ automation_rules table is now accessible!');
            
            // Insert a test record
            console.log('\n📝 Inserting test automation rule...');
            const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/automation_rules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    name: 'Test Automation Rule',
                    description: 'A test automation rule created via XHR',
                    rule_type: 'test',
                    is_active: true,
                    trigger_conditions: { trigger: 'manual' },
                    actions: { action: 'test' }
                })
            });

            if (insertResponse.ok) {
                const insertedData = await insertResponse.json();
                console.log('✅ Test automation rule inserted successfully!');
                console.log('🗂️  Data:', JSON.stringify(insertedData, null, 2));
            } else {
                const insertError = await insertResponse.text();
                console.error('❌ Failed to insert test record:', insertError);
            }
        } else {
            const errorText = await testResponse.text();
            console.error('❌ Table still not accessible:', errorText);
        }
    } catch (error) {
        console.error('💥 Test failed:', error.message);
    }
    
    console.log('\n🎉 Direct SQL execution completed!');
}

executeDirectSQL();