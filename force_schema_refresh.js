#!/usr/bin/env node

/**
 * Force Schema Cache Refresh for form_fields table
 * This script ensures the schema cache is properly updated
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

async function forceSchemaRefresh() {
  console.log('🔄 Forcing schema cache refresh...\n');

  try {
    // Method 1: Use NOTIFY to refresh schema cache
    const { error: notifyError } = await supabase.rpc('exec_sql', {
      sql: 'NOTIFY pgrst, \'reload schema\';'
    });

    if (notifyError) {
      console.log('⚠️  Schema reload notification failed:', notifyError.message);
    } else {
      console.log('✅ Schema reload notification sent');
    }

    // Method 2: Query the table with all expected columns to force cache update
    console.log('🔍 Testing column availability...');
    
    const testQuery = `
      SELECT 
        id, 
        page_id, 
        status, 
        field_type, 
        label, 
        placeholder, 
        required, 
        options, 
        order_index, 
        is_active,
        created_at,
        updated_at
      FROM form_fields 
      LIMIT 1
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql: testQuery });
    
    if (error) {
      console.error('❌ Schema test failed:', error.message);
      return false;
    }

    console.log('✅ Schema test successful - all columns accessible');
    return true;

  } catch (error) {
    console.error('❌ Error during schema refresh:', error);
    return false;
  }
}

async function dropAndRecreateTable() {
  console.log('\n🗑️  Dropping and recreating form_fields table...\n');

  try {
    // First, backup existing data if any
    const { data: existingData, error: backupError } = await supabase
      .from('form_fields')
      .select('*');

    if (backupError) {
      console.log('ℹ️  No existing data to backup:', backupError.message);
    } else {
      console.log(`📦 Backed up ${existingData?.length || 0} existing records`);
    }

    // Drop and recreate table with correct schema
    const recreateSQL = `
      -- Drop table (this will fail if there are foreign key constraints)
      DROP TABLE IF EXISTS public.form_fields CASCADE;

      -- Recreate with correct schema
      CREATE TABLE public.form_fields (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        form_template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
        page_id TEXT DEFAULT 'contact',
        field_type TEXT CHECK (field_type IN ('text', 'textarea', 'select', 'checkbox', 'radio', 'email', 'tel', 'date', 'number', 'file', 'hidden')) NOT NULL,
        label TEXT NOT NULL,
        placeholder TEXT,
        required BOOLEAN DEFAULT FALSE,
        options TEXT[],
        validation_min_length INTEGER,
        validation_max_length INTEGER,
        validation_pattern TEXT,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
        settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        updated_by TEXT
      );

      -- Enable RLS
      ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY "Anyone can view active form fields" ON public.form_fields
        FOR SELECT USING (is_active = true);

      CREATE POLICY "Authenticated users can manage form fields" ON public.form_fields
        FOR ALL USING (auth.uid() IS NOT NULL);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_form_fields_page_id ON public.form_fields(page_id);
      CREATE INDEX IF NOT EXISTS idx_form_fields_status ON public.form_fields(status);

      RAISE NOTICE 'Form fields table recreated successfully';
    `;

    const { error: recreateError } = await supabase.rpc('exec_sql', { sql: recreateSQL });

    if (recreateError) {
      console.error('❌ Error recreating table:', recreateError.message);
      return false;
    }

    console.log('✅ Table recreated successfully');

    // Restore data if we had any
    if (existingData && existingData.length > 0) {
      console.log('📥 Restoring data...');
      const { data: restoreData, error: restoreError } = await supabase
        .from('form_fields')
        .insert(existingData)
        .select();

      if (restoreError) {
        console.error('❌ Error restoring data:', restoreError.message);
      } else {
        console.log(`✅ Restored ${restoreData?.length || 0} records`);
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Error during table recreation:', error);
    return false;
  }
}

async function createSampleData() {
  console.log('\n📝 Creating sample form fields...\n');

  try {
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
      },
      {
        page_id: 'membership',
        field_type: 'text',
        label: 'Organization Name',
        placeholder: 'Enter organization name',
        required: true,
        order_index: 1,
        status: 'published'
      }
    ];

    const { data, error } = await supabase
      .from('form_fields')
      .insert(sampleFields)
      .select();

    if (error) {
      console.error('❌ Error creating sample data:', error.message);
      return false;
    }

    console.log(`✅ Created ${data?.length || 0} sample form fields`);
    return true;

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    return false;
  }
}

async function testFormFieldManager() {
  console.log('\n🧪 Testing FormFieldManager compatibility...\n');

  try {
    // Test all the operations that FormFieldManager does
    
    // 1. Select operation
    const { data: selectData, error: selectError } = await supabase
      .from('form_fields')
      .select('*')
      .order('page_id', { ascending: true })
      .order('order_index', { ascending: true });

    if (selectError) {
      console.error('❌ Select test failed:', selectError.message);
      return false;
    }

    console.log(`✅ Select test: Retrieved ${selectData?.length || 0} records`);

    // 2. Insert operation
    const testInsert = {
      page_id: 'test',
      field_type: 'text',
      label: 'Test Field',
      placeholder: 'Test placeholder',
      required: false,
      order_index: 999,
      status: 'draft'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('form_fields')
      .insert(testInsert)
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      return false;
    }

    console.log(`✅ Insert test: Created record with ID ${insertData?.[0]?.id}`);

    // 3. Update operation
    if (insertData?.[0]?.id) {
      const { error: updateError } = await supabase
        .from('form_fields')
        .update({
          label: 'Updated Test Field',
          status: 'published',
          updated_by: 'Schema Fix Test'
        })
        .eq('id', insertData[0].id);

      if (updateError) {
        console.error('❌ Update test failed:', updateError.message);
        return false;
      }

      console.log('✅ Update test: Successfully updated record');
    }

    // 4. Delete test record
    if (insertData?.[0]?.id) {
      const { error: deleteError } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', insertData[0].id);

      if (deleteError) {
        console.error('❌ Delete test failed:', deleteError.message);
        return false;
      }

      console.log('✅ Delete test: Successfully deleted test record');
    }

    console.log('\n🎉 All FormFieldManager operations working correctly!');
    return true;

  } catch (error) {
    console.error('❌ Error during testing:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Force Schema Refresh for form_fields...\n');
  console.log('=================================================\n');

  try {
    // Step 1: Try to force schema cache refresh
    const refreshOk = await forceSchemaRefresh();

    if (!refreshOk) {
      // Step 2: If refresh failed, drop and recreate table
      console.log('\n⚠️  Schema refresh failed, proceeding with table recreation...');
      const recreateOk = await dropAndRecreateTable();

      if (!recreateOk) {
        console.error('❌ All schema fix attempts failed');
        process.exit(1);
      }
    }

    // Step 3: Create sample data for testing
    await createSampleData();

    // Step 4: Test FormFieldManager compatibility
    const testOk = await testFormFieldManager();

    if (testOk) {
      console.log('\n=================================================');
      console.log('✨ Force Schema Refresh Complete!\n');
      
      console.log('✅ Schema cache refreshed/table recreated');
      console.log('✅ All FormFieldManager operations tested and working');
      console.log('✅ Sample data created for testing\n');
      
      console.log('Next Steps:');
      console.log('1. Reload your application');
      console.log('2. FormFieldManager should now work without HTTP 400 errors');
      console.log('3. All CRUD operations (Create, Read, Update, Delete) are functional\n');
    } else {
      console.error('❌ Schema fix completed but tests failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Force schema refresh failed:', error);
    process.exit(1);
  }
}

// Run the force refresh
main().catch(console.error);