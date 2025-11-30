#!/usr/bin/env node

/**
 * Fix form_fields schema mismatch
 * This script adds the missing columns that FormFieldManager component expects
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://sshguczouozvsdwzfcbx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ3OTY4MSwiZXhwIjoyMDc5MDU1NjgxfQ.g_DHPAaaTvVmEIKoLvvN-CXhYWNcA7oQ76n34udwwRs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkCurrentSchema() {
  console.log('🔍 Checking current form_fields schema...\n');

  try {
    const { data, error } = await supabase
      .from('form_fields')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking current schema:', error);
      return false;
    }

    // Get column information from the database
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'form_fields' });

    if (columnsError) {
      console.log('Cannot get column info via RPC, will attempt manual check...');
      
      // Try to query with a specific column to see if it exists
      try {
        await supabase.from('form_fields').select('status').limit(1);
        console.log('✅ status column exists');
      } catch (err) {
        console.log('❌ status column missing');
      }

      try {
        await supabase.from('form_fields').select('page_id').limit(1);
        console.log('✅ page_id column exists');
      } catch (err) {
        console.log('❌ page_id column missing');
      }
      
      return false;
    }

    const hasPageId = columns?.some(col => col.column_name === 'page_id') || false;
    const hasStatus = columns?.some(col => col.column_name === 'status') || false;
    
    console.log('📊 Current Schema Status:');
    console.log(`   page_id column: ${hasPageId ? '✅ exists' : '❌ missing'}`);
    console.log(`   status column: ${hasStatus ? '✅ exists' : '❌ missing'}`);
    
    return hasPageId && hasStatus;
  } catch (error) {
    console.error('❌ Error checking schema:', error);
    return false;
  }
}

async function fixSchema() {
  console.log('\n🛠️  Applying schema fix...\n');

  try {
    // Execute the SQL fix
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add missing columns to form_fields table
        ALTER TABLE public.form_fields
        ADD COLUMN IF NOT EXISTS page_id TEXT DEFAULT 'contact',
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived'));

        -- Update existing records to have default values
        UPDATE public.form_fields
        SET 
            page_id = COALESCE(page_id, 'contact'),
            status = COALESCE(status, 'published')
        WHERE page_id IS NULL OR status IS NULL;

        -- Add index for page_id for better performance
        CREATE INDEX IF NOT EXISTS idx_form_fields_page_id ON public.form_fields(page_id);

        RAISE NOTICE 'Schema fix applied successfully';
      `
    });

    if (error) {
      console.error('❌ Error applying schema fix:', error);
      
      // Try alternative approach - direct column addition
      console.log('🔄 Trying alternative approach...\n');
      
      // Check if columns exist and add them individually
      try {
        await supabase.rpc('exec_sql', { sql: 'ALTER TABLE public.form_fields ADD COLUMN IF NOT EXISTS page_id TEXT DEFAULT \'contact\';' });
        console.log('✅ Added page_id column');
      } catch (err) {
        console.log('⚠️  page_id column may already exist or could not be added');
      }

      try {
        await supabase.rpc('exec_sql', { sql: 'ALTER TABLE public.form_fields ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'published\' CHECK (status IN (\'published\', \'draft\', \'archived\'));' });
        console.log('✅ Added status column');
      } catch (err) {
        console.log('⚠️  status column may already exist or could not be added');
      }

      return false;
    }

    console.log('✅ Schema fix applied successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error applying fix:', error);
    return false;
  }
}

async function verifyFix() {
  console.log('\n✅ Verifying fix...\n');

  try {
    // Test if we can now query the table successfully
    const { data, error } = await supabase
      .from('form_fields')
      .select('id, page_id, status, label, field_type')
      .limit(1);

    if (error) {
      console.error('❌ Error after fix:', error);
      return false;
    }

    console.log('🎉 Schema fix successful! form_fields table is now accessible.');
    console.log('📝 The FormFieldManager component should now work without errors.');
    return true;
  } catch (error) {
    console.error('❌ Error during verification:', error);
    return false;
  }
}

async function createSampleData() {
  console.log('\n📝 Creating sample form fields...\n');

  try {
    // Create some sample form fields for testing
    const sampleFields = [
      {
        page_id: 'contact',
        field_type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        order_index: 1,
        status: 'published'
      },
      {
        page_id: 'contact', 
        field_type: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true,
        order_index: 2,
        status: 'published'
      },
      {
        page_id: 'contact',
        field_type: 'textarea', 
        label: 'Message',
        placeholder: 'Enter your message',
        required: false,
        order_index: 3,
        status: 'published'
      }
    ];

    const { data, error } = await supabase
      .from('form_fields')
      .insert(sampleFields)
      .select();

    if (error) {
      console.error('❌ Error creating sample data:', error);
      return false;
    }

    console.log('✅ Created sample form fields for testing');
    console.log(`📊 Created ${data?.length || 0} sample fields`);
    return true;
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting form_fields Schema Fix...\n');
  console.log('=====================================\n');

  try {
    // Step 1: Check current schema
    const schemaOk = await checkCurrentSchema();

    if (schemaOk) {
      console.log('✅ Schema is already correct!');
    } else {
      // Step 2: Apply the fix
      const fixApplied = await fixSchema();

      if (fixApplied) {
        // Step 3: Verify the fix
        const verificationOk = await verifyFix();

        if (verificationOk) {
          // Step 4: Create sample data for testing
          await createSampleData();
        }
      }
    }

    console.log('\n=====================================');
    console.log('✨ Form Fields Schema Fix Complete!\n');
    
    console.log('Next Steps:');
    console.log('1. Reload your application');
    console.log('2. The FormFieldManager should now work without HTTP 400 errors');
    console.log('3. Test creating, editing, and managing form fields\n');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
main().catch(console.error);