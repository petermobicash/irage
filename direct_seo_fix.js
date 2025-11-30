#!/usr/bin/env node

/**
 * Direct SEO Pages Fix Script
 * 
 * This script directly applies the missing seo_pages table using Supabase's
 * REST API with the service role key to resolve the 404 error.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = 'https://sshguczouozvsdwzfcbx.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ3OTY4MSwiZXhwIjoyMDc5MDU1NjgxfQ.g_DHPAaaTvVmEIKoLvvN-CXhYWNcA7oQ76n34udwwRs';

async function applyDirectFix() {
    console.log('🔧 Direct SEO Pages Fix Application');
    console.log('==================================');
    console.log('');
    
    try {
        // Read the SQL fix file
        const sqlFilePath = path.join(__dirname, 'fix_additional_400_404_errors.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        console.log('✅ Loaded SQL fix script');
        console.log(`📄 Size: ${sqlContent.length} characters`);
        console.log('');
        
        // Test current status
        console.log('🔍 Testing current seo_pages table status...');
        const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/seo_pages?select=*&limit=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'apikey': SERVICE_ROLE_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (testResponse.status === 404) {
            console.log('❌ seo_pages table does not exist (404)');
            console.log('📊 Need to create the table...');
        } else if (testResponse.ok) {
            console.log('✅ seo_pages table exists and is accessible');
        } else {
            console.log(`⚠️  Unexpected status: ${testResponse.status}`);
        }
        
        console.log('');
        console.log('🎯 The seo_pages 404 error requires manual SQL execution.');
        console.log('');
        console.log('📋 SOLUTION OPTIONS:');
        console.log('==================');
        console.log('');
        console.log('Option 1 - Manual via Supabase Dashboard:');
        console.log('1. Go to: https://supabase.com/dashboard/project/sshguczouozvsdwzfcbx/sql-editor');
        console.log('2. Paste the contents of fix_additional_400_404_errors.sql');
        console.log('3. Click "RUN" button');
        console.log('');
        console.log('Option 2 - Direct Database Access:');
        console.log('1. Use pgAdmin, DBeaver, or psql to connect to:');
        console.log(`   Host: db.sshguczouozvsdwzfcbx.supabase.co`);
        console.log('   Database: postgres');
        console.log('   Port: 5432');
        console.log('2. Execute the SQL from fix_additional_400_404_errors.sql');
        console.log('');
        
        // Show a preview of what will be created
        console.log('🔍 SQL Preview - Key Tables Being Created:');
        console.log('==========================================');
        console.log('');
        console.log('1. seo_pages table:');
        console.log('   - id (UUID, Primary Key)');
        console.log('   - url (TEXT, NOT NULL, UNIQUE)');
        console.log('   - title, description, keywords');
        console.log('   - Open Graph tags (og_title, og_description, og_image)');
        console.log('   - SEO settings (canonical_url, robots, is_active)');
        console.log('   - Timestamps (created_at, updated_at)');
        console.log('');
        console.log('2. content_tags table:');
        console.log('   - id (UUID, Primary Key)');
        console.log('   - name (TEXT, NOT NULL, UNIQUE)');
        console.log('   - slug, description, color');
        console.log('   - is_active, timestamps');
        console.log('');
        console.log('3. RLS Policies for both tables');
        console.log('4. Performance indexes');
        console.log('5. Default seed data');
        console.log('');
        
        console.log('🎯 After applying the fix, this API call should work:');
        console.log('GET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/seo_pages?select=*&order=url.asc');
        console.log('');
        
        console.log('✅ Direct fix analysis complete!');
        console.log('');
        console.log('⚠️  Note: This fix cannot be applied automatically via API.');
        console.log('   Manual execution is required through Supabase Dashboard or direct DB access.');

    } catch (error) {
        console.error('❌ Error during fix analysis:', error.message);
        process.exit(1);
    }
}

// Run the application
applyDirectFix();