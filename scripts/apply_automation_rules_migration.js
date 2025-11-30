#!/usr/bin/env node

/**
 * Apply automation_rules table creation script
 * This script creates the missing automation_rules table in Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase configuration. Check .env file.');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

async function applyMigration() {
    try {
        console.log('🚀 Applying automation_rules table migration...');
        console.log(`📡 Connecting to: ${SUPABASE_URL}`);

        // Read the SQL migration file
        const migrationPath = path.join(__dirname, '../create_automation_rules_table.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Split SQL into individual statements (simple split on semicolon)
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0)
            .map(stmt => stmt + ';');

        console.log(`📋 Found ${statements.length} SQL statements to execute`);

        // Apply each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({
                    query: statement
                })
            });

            if (!response.ok) {
                // Try alternative approach - use PostgreSQL RPC
                const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pg_sql`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_SERVICE_ROLE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    },
                    body: JSON.stringify({
                        sql: statement
                    })
                });

                if (!altResponse.ok) {
                    const errorText = await response.text();
                    console.error(`❌ Failed to execute statement ${i + 1}:`, errorText);
                    console.log('🔧 Statement:', statement.substring(0, 100) + '...');
                } else {
                    console.log(`✅ Statement ${i + 1} applied successfully`);
                }
            } else {
                console.log(`✅ Statement ${i + 1} applied successfully`);
            }
        }

        // Test the table by trying the original XHR request
        console.log('\n🧪 Testing the automation_rules table...');
        
        const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/automation_rules?select=*&order=created_at.desc`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            }
        });

        if (testResponse.ok) {
            const data = await testResponse.json();
            console.log('✅ automation_rules table is now accessible!');
            console.log(`📊 Current data count: ${data.length} records`);
            console.log('🗂️  Data:', JSON.stringify(data, null, 2));
        } else {
            const errorText = await testResponse.text();
            console.error('❌ Failed to access automation_rules table:', errorText);
        }

        console.log('\n🎉 Migration completed!');
        
    } catch (error) {
        console.error('💥 Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
applyMigration();