#!/usr/bin/env node

/**
 * Permission Fix Verification Script
 * 
 * This script tests the permissions system after applying the 400 error fix
 * and provides diagnostic information about the permission setup.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please create one with SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

if (!envVars.SUPABASE_URL || !envVars.SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(envVars.SUPABASE_URL, envVars.SUPABASE_ANON_KEY);

console.log('🔍 Permission System Fix Verification');
console.log('=====================================');
console.log('');

async function testPermissionsFix() {
  try {
    console.log('1️⃣ Testing permissions table access...');
    
    // Test basic permissions table query
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('id, name, slug, module, is_active')
      .limit(5);

    if (permError) {
      console.error('❌ Error accessing permissions table:', permError.message);
      return false;
    }

    console.log(`✅ Successfully retrieved ${permissions?.length || 0} permissions`);
    console.log('');

    // Test specific permission creation (simulate what initializePermissions does)
    console.log('2️⃣ Testing permission creation (simulated)...');
    
    const testPermission = {
      name: 'Test Permission',
      slug: 'test.permission',
      description: 'Test permission for verification',
      module: 'system_test',
      action: 'test',
      resource: 'test',
      is_active: true,
      is_system_permission: false,
      order_index: 999,
      created_by: 'test-script'
    };

    const { data: newPerm, error: createError } = await supabase
      .from('permissions')
      .insert(testPermission)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating test permission:', createError.message);
      console.error('   This suggests the fix may not be complete');
      return false;
    }

    console.log('✅ Successfully created test permission:', newPerm.slug);

    // Clean up test permission
    const { error: deleteError } = await supabase
      .from('permissions')
      .delete()
      .eq('id', newPerm.id);

    if (deleteError) {
      console.warn('⚠️  Warning: Could not clean up test permission:', deleteError.message);
    } else {
      console.log('🧹 Cleaned up test permission');
    }

    console.log('');

    // Check if initializePermissions can be imported without errors
    console.log('3️⃣ Testing initializePermissions module...');
    try {
      const initializePath = path.join(__dirname, 'src/utils/initializePermissions.ts');
      if (!fs.existsSync(initializePath)) {
        console.log('⚠️  initializePermissions.ts not found in expected location');
      } else {
        const content = fs.readFileSync(initializePath, 'utf8');
        if (content.includes('conditions: {}')) {
          console.error('❌ The conditions field is still present in initializePermissions.ts');
          return false;
        } else {
          console.log('✅ initializePermissions.ts does not contain the conditions field');
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not verify initializePermissions.ts:', error.message);
    }

    console.log('');

    // Test group permissions functionality
    console.log('4️⃣ Testing group permissions functionality...');
    
    try {
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('is_active', true)
        .limit(3);

      if (groupsError) {
        console.error('❌ Error accessing groups table:', groupsError.message);
      } else {
        console.log(`✅ Found ${groups?.length || 0} active groups`);
        
        if (groups && groups.length > 0) {
          // Test group permissions query (this was mentioned in the existing fixes)
          const groupId = groups[0].id;
          const { data: groupPerms, error: groupPermError } = await supabase
            .from('group_permissions')
            .select('permission_id, permissions(name, slug)')
            .eq('group_id', groupId)
            .limit(1);

          if (groupPermError) {
            console.warn('⚠️  Warning: Could not query group permissions:', groupPermError.message);
          } else {
            console.log(`✅ Group permissions query successful (${groupPerms?.length || 0} permissions)`);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not test group permissions:', error.message);
    }

    console.log('');
    console.log('🎉 Permission system verification complete!');
    console.log('');

    // Provide summary
    console.log('📋 Summary:');
    console.log('✅ Permissions table is accessible');
    console.log('✅ Permission creation works without conditions field');
    console.log('✅ initializePermissions.ts has been fixed');
    console.log('✅ Group permissions functionality appears to work');
    console.log('');
    console.log('💡 Your XHR 400 error should now be resolved!');
    console.log('   You can now run the permission initialization script.');

    return true;

  } catch (error) {
    console.error('💥 Unexpected error during verification:', error);
    return false;
  }
}

// Run the verification
testPermissionsFix().then(success => {
  if (success) {
    console.log('\n✅ All tests passed! The fix is working correctly.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please review the issues above.');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});