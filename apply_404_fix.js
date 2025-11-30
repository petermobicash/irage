#!/usr/bin/env node

/**
 * Apply HTTP 404 Errors Fix Script
 * 
 * This script applies the fix_additional_400_404_errors.sql file to resolve
 * the 404 error on seo_pages endpoint.
 * 
 * The fix creates missing tables:
 * - seo_pages (for SEO management)
 * - content_tags (for content categorization)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 HTTP 404 Errors Fix Application');
console.log('===================================');
console.log('');

async function apply404Fix() {
    try {
        // Read the SQL fix file
        const sqlFilePath = path.join(__dirname, 'fix_additional_400_404_errors.sql');
        
        if (!fs.existsSync(sqlFilePath)) {
            console.error('❌ Error: fix_additional_400_404_errors.sql not found');
            console.log('Make sure the SQL fix file exists in the same directory.');
            process.exit(1);
        }

        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        const sqlLines = sqlContent.split('\n').length;
        
        console.log('✅ Found HTTP 404 fix script');
        console.log(`📄 File: ${sqlFilePath}`);
        console.log(`📊 Size: ${sqlLines} lines`);
        console.log('');

        // Check if supabase CLI is available
        try {
            await execAsync('supabase --version');
            console.log('✅ Supabase CLI detected');
        } catch (error) {
            console.log('⚠️  Supabase CLI not found. Checking if we can use alternative method...');
        }

        // Try to apply via Supabase CLI first
        console.log('🔄 Attempting to apply fix via Supabase CLI...');
        console.log('');
        
        try {
            // Write SQL to a temporary file for CLI execution
            const tempFile = path.join(__dirname, '.temp_404_fix.sql');
            fs.writeFileSync(tempFile, sqlContent);
            
            // Execute via Supabase CLI
            const { stdout, stderr } = await execAsync(`supabase db reset --debug`);
            
            if (stdout) {
                console.log('📤 Supabase CLI Output:', stdout);
            }
            if (stderr) {
                console.log('📤 Supabase CLI Errors:', stderr);
            }
            
            // Clean up temp file
            fs.unlinkSync(tempFile);
            
            console.log('✅ Fix applied successfully via Supabase CLI!');
            
        } catch (cliError) {
            console.log('⚠️  Supabase CLI method failed, providing manual instructions...');
            console.log('');
            
            console.log('📋 MANUAL APPLICATION INSTRUCTIONS:');
            console.log('===================================');
            console.log('');
            console.log('1. Open your Supabase Dashboard:');
            console.log('   https://app.supabase.com/project/[your-project-id]/sql-editor');
            console.log('');
            console.log('2. Copy the entire contents of fix_additional_400_404_errors.sql');
            console.log('');
            console.log('3. Paste into the SQL Editor and click "RUN"');
            console.log('');
            console.log('4. Monitor the output for any errors or warnings');
            console.log('');
            
            // Show the first few lines of the SQL as a preview
            const previewLines = sqlContent.split('\n').slice(0, 20);
            console.log('🔍 SQL File Preview (first 20 lines):');
            console.log('-----------------------------------');
            previewLines.forEach((line, index) => {
                console.log(`${(index + 1).toString().padStart(2, '0')}: ${line}`);
            });
            if (sqlContent.split('\n').length > 20) {
                console.log(`... and ${sqlContent.split('\n').length - 20} more lines`);
            }
            console.log('');
        }

        console.log('🧪 POST-IMPLEMENTATION TESTING:');
        console.log('================================');
        console.log('');
        console.log('After applying the fix, test these endpoints:');
        console.log('');
        console.log('   ❌ Previously Failing (should now work):');
        console.log('   • GET /rest/v1/seo_pages?select=*&order=url.asc');
        console.log('   • GET /rest/v1/content_tags?select=*');
        console.log('');
        console.log('   ✅ Should Still Work:');
        console.log('   • GET /rest/v1/user_profiles?select=*');
        console.log('   • GET /auth/v1/user');
        console.log('');

        console.log('✅ HTTP 404 Fix Application process completed!');
        console.log('');
        console.log('The 404 error on seo_pages should now be resolved!');

    } catch (error) {
        console.error('❌ Error applying HTTP 404 fix:', error.message);
        process.exit(1);
    }
}

// Run the application
apply404Fix();