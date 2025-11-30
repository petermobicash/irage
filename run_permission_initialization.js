#!/usr/bin/env node

/**
 * Run Permission Initialization
 * 
 * This script runs the permission initialization process that was failing
 * with the XHR 400 error due to the conditions field issue.
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

// Import permission definitions (simplified version for testing)
const GRANULAR_PERMISSIONS = [
  { name: 'View Users', slug: 'users.view', description: 'View user list and details', module: 'user_management', category: 'users', isSystemPermission: true, orderIndex: 1 },
  { name: 'Create Users', slug: 'users.create', description: 'Create new users', module: 'user_management', category: 'users', isSystemPermission: true, orderIndex: 2 },
  { name: 'Edit Users', slug: 'users.edit', description: 'Edit user information', module: 'user_management', category: 'users', isSystemPermission: true, orderIndex: 3 },
  { name: 'View Roles', slug: 'roles.view', description: 'View roles and permissions', module: 'role_management', category: 'roles', isSystemPermission: true, orderIndex: 4 },
  { name: 'View Content', slug: 'content.view', description: 'View all content', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 5 },
  { name: 'Create Content', slug: 'content.create', description: 'Create new content', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 6 }
];

console.log('🚀 Starting Permission Initialization (Fixed Version)');
console.log('==================================================');
console.log('');

async function initializePermissions() {
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const permission of GRANULAR_PERMISSIONS) {
    try {
      console.log(`📋 Processing: ${permission.name} (${permission.slug})`);

      // Check if permission already exists
      const { data: existingPermission, error: checkError } = await supabase
        .from('permissions')
        .select('id')
        .eq('slug', permission.slug)
        .eq('is_active', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Failed to check existing permission ${permission.slug}: ${checkError.message}`);
        errors++;
        continue;
      }

      if (existingPermission) {
        console.log(`⏭️  Permission "${permission.name}" already exists, skipping...`);
        skipped++;
        continue;
      }

      // Create the permission (FIXED VERSION - no conditions field)
      const { data: newPermission, error: createError } = await supabase
        .from('permissions')
        .insert({
          name: permission.name,
          slug: permission.slug,
          description: permission.description,
          module: permission.module,
          action: permission.slug.split('.').pop() || 'manage',
          resource: permission.category,
          // ✅ conditions field removed - this was causing the 400 error
          is_active: true,
          is_system_permission: permission.isSystemPermission,
          order_index: permission.orderIndex,
          created_by: 'system'
        })
        .select()
        .single();

      if (createError) {
        console.error(`❌ Failed to create permission ${permission.slug}: ${createError.message}`);
        errors++;
        continue;
      }

      console.log(`✅ Created permission: ${permission.name} (ID: ${newPermission.id})`);
      created++;

    } catch (error) {
      console.error(`💥 Unexpected error for ${permission.name}:`, error);
      errors++;
    }
  }

  console.log('');
  console.log('🎉 Permission Initialization Complete!');
  console.log('=====================================');
  console.log(`✅ Created: ${created} permissions`);
  console.log(`⏭️  Skipped: ${skipped} permissions`);
  console.log(`❌ Errors: ${errors} permissions`);
  console.log('');

  if (errors === 0) {
    console.log('🎯 All permissions initialized successfully!');
    console.log('');
    console.log('💡 Your XHR 400 error has been resolved.');
    console.log('   The POST /rest/v1/permissions requests should now work.');
    
    // Test that we can query the permissions
    console.log('');
    console.log('🧪 Testing query of created permissions...');
    const { data: testPerms, error: testError } = await supabase
      .from('permissions')
      .select('name, slug, module')
      .order('order_index')
      .limit(3);

    if (testError) {
      console.log('⚠️  Warning: Could not query created permissions:', testError.message);
    } else {
      console.log('✅ Successfully queried created permissions:');
      testPerms?.forEach(perm => {
        console.log(`   • ${perm.name} (${perm.slug})`);
      });
    }

  } else {
    console.log('⚠️  Some permissions failed to initialize. Please check the errors above.');
  }

  return { created, skipped, errors };
}

// Run the initialization
initializePermissions().then(result => {
  if (result.errors === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Fatal error during initialization:', error);
  process.exit(1);
});