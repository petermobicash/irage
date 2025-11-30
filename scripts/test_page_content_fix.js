#!/usr/bin/env node

/**
 * Test script to verify page_content XHR error fix
 * This simulates the issue and shows the solution
 */

const SUPABASE_URL = 'https://sshguczouozvsdwzfcbx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Nzk2ODEsImV4cCI6MjA3OTA1NTY4MX0.ooh5NGBqv6U0MLcwvURzcf-DVx_qvpYobdjy-ukpKbw';

async function testPageContentFix() {
    console.log('🧪 Testing page_content XHR error fix...');
    console.log('');
    
    // Simulate the frontend data being sent
    const testData = {
        page_id: 'home',  // String value that causes 22P02 error
        section_id: 'hero',
        title: 'Test Content - Fix Verification',
        content: 'This is test content to verify the schema fix works',
        order_index: 0,
        is_active: true
    };

    console.log('📤 Test Data to POST:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');

    console.log('🔍 Issue Analysis:');
    console.log('- Frontend sends: page_id = "home" (TEXT)');
    console.log('- Database expects: page_id = UUID');
    console.log('- Result: PostgreSQL error 22P02 (invalid text representation)');
    console.log('');

    console.log('💡 Solution:');
    console.log('Execute this SQL in Supabase Dashboard SQL Editor:');
    console.log('='.repeat(60));
    console.log(`
-- Fix the schema mismatch
BEGIN;

-- Change page_id from UUID to TEXT
ALTER TABLE public.page_content 
ALTER COLUMN page_id TYPE TEXT;

-- Update existing data if needed
UPDATE public.page_content 
SET page_id = 'home' 
WHERE page_id NOT IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved');

-- Add validation constraint
ALTER TABLE public.page_content 
DROP CONSTRAINT IF EXISTS valid_page_id;
ALTER TABLE public.page_content 
ADD CONSTRAINT valid_page_id 
CHECK (page_id IN ('home', 'about', 'spiritual', 'philosophy', 'culture', 'programs', 'get-involved', 'dashboard', 'admin', 'profile', 'settings', 'login', 'register'));

-- Create performance index
CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON public.page_content(page_id);

COMMIT;
`);
    console.log('='.repeat(60));
    console.log('');

    console.log('🎯 Expected Result After Fix:');
    console.log('✅ page_id column type changes from UUID to TEXT');
    console.log('✅ Frontend can POST string values like "home", "about", etc.');
    console.log('✅ No more 400 errors or 22P02 PostgreSQL errors');
    console.log('✅ Page content management works correctly');
    console.log('');

    // Test current status (this should fail with 22P02)
    console.log('📥 Testing current status (should fail with 22P02)...');
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/page_content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ POST succeeded! The fix has been applied.');
            console.log('📄 Response:', JSON.stringify(result, null, 2));
        } else {
            console.log(`❌ POST failed with status ${response.status}`);
            console.log('💥 Error:', JSON.stringify(result, null, 2));
            
            if (result.code === '22P02') {
                console.log('');
                console.log('🎯 This confirms the issue: PostgreSQL error 22P02');
                console.log('🔧 Apply the SQL fix above to resolve this error.');
            }
        }
    } catch (error) {
        console.log('💥 Network/Request error:', error.message);
    }

    console.log('');
    console.log('📚 Additional Information:');
    console.log('- Full solution: XHR_400_ERROR_COMPLETE_SOLUTION.md');
    console.log('- Direct SQL: fix_page_content_schema_mismatch.sql');
    console.log('- Migration: supabase/migrations/20251126111059_fix_page_content_schema_mismatch.sql');
    console.log('');
    console.log('🎉 Test completed! Execute the SQL fix to resolve the XHR 400 error.');
}

testPageContentFix();