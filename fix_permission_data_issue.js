#!/usr/bin/env node

/**
 * Complete Permission Data Fix Script
 * This script automatically fixes the "Permission data is missing for item" error
 * by cleaning up orphaned records in the group_permissions table
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

async function diagnosePermissionIssues() {
  console.log('🔍 Diagnosing permission data issues...\n');

  try {
    // Get total group_permissions records
    const { count: totalGroupPerms } = await supabase
      .from('group_permissions')
      .select('*', { count: 'exact', head: true });

    // Get group_permissions with valid permission_id
    const { data: validPerms, count: validCount } = await supabase
      .from('group_permissions')
      .select(`
        id,
        group_id,
        permission_id,
        created_at,
        groups(name),
        permissions(id, name, slug)
      `, { count: 'exact' })
      .not('permissions.id', 'is', null);

    // Calculate orphaned permissions
    const orphanedCount = totalGroupPerms - validCount;
    
    console.log('📊 Permission Analysis Results:');
    console.log(`   Total group_permissions records: ${totalGroupPerms}`);
    console.log(`   Valid group_permissions records: ${validCount}`);
    console.log(`   Orphaned group_permissions records: ${orphanedCount}`);
    console.log(`   Cleanup needed: ${orphanedCount > 0 ? 'YES' : 'NO'}\n`);

    if (orphanedCount > 0) {
      console.log('⚠️  Orphaned Permissions Found:');
      
      // Get specific orphaned records for manual review
      const { data: orphanedPerms } = await supabase
        .from('group_permissions')
        .select(`
          id,
          group_id,
          permission_id,
          created_at,
          groups(name)
        `)
        .is('permissions.id', null);

      orphanedPerms?.slice(0, 10).forEach((perm, index) => {
        console.log(`   ${index + 1}. Group: ${perm.groups?.name || 'Unknown'} | Permission ID: ${perm.permission_id}`);
      });

      if (orphanedPerms && orphanedPerms.length > 10) {
        console.log(`   ... and ${orphanedPerms.length - 10} more orphaned permissions`);
      }

      return { orphanedPerms, cleanupNeeded: true };
    }

    return { cleanupNeeded: false };
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    throw error;
  }
}

async function cleanupOrphanedPermissions() {
  console.log('\n🧹 Cleaning up orphaned permissions...\n');

  try {
    // Get orphaned permission IDs
    const { data: orphanedPerms } = await supabase
      .from('group_permissions')
      .select('permission_id')
      .is('permissions.id', null);

    if (!orphanedPerms || orphanedPerms.length === 0) {
      console.log('✅ No orphaned permissions found to clean up.');
      return { cleaned: 0 };
    }

    const orphanedIds = orphanedPerms.map(p => p.permission_id);
    console.log(`Found ${orphanedIds.length} orphaned permissions to remove:`);
    orphanedIds.slice(0, 5).forEach(id => console.log(`   - ${id}`));
    if (orphanedIds.length > 5) {
      console.log(`   ... and ${orphanedIds.length - 5} more`);
    }

    // Delete orphaned permissions using a more efficient approach
    const { error, count } = await supabase
      .rpc('cleanup_orphaned_group_permissions', {
        orphaned_permission_ids: orphanedIds
      });

    if (error) {
      // If RPC doesn't exist, use manual deletion
      console.log('Using manual cleanup approach...');
      
      let cleanedCount = 0;
      for (const permissionId of orphanedIds) {
        const { error: deleteError } = await supabase
          .from('group_permissions')
          .delete()
          .eq('permission_id', permissionId)
          .is('permissions.id', null);

        if (!deleteError) {
          cleanedCount++;
        }
      }

      console.log(`✅ Successfully cleaned up ${cleanedCount} orphaned permissions.`);
      return { cleaned: cleanedCount };
    }

    console.log(`✅ Successfully cleaned up ${count} orphaned permissions.`);
    return { cleaned: count };
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

async function createCleanupFunction() {
  console.log('\n🔧 Creating cleanup function in database...\n');

  const cleanupSQL = `
    CREATE OR REPLACE FUNCTION cleanup_orphaned_group_permissions(orphaned_permission_ids UUID[])
    RETURNS INTEGER AS $$
    DECLARE
      cleaned_count INTEGER;
    BEGIN
      DELETE FROM group_permissions 
      WHERE permission_id = ANY(orphaned_permission_ids)
        AND permission_id NOT IN (SELECT id FROM permissions WHERE id IS NOT NULL);
      
      GET DIAGNOSTICS cleaned_count = ROW_COUNT;
      
      RAISE NOTICE 'Cleaned up % orphaned group_permissions records', cleaned_count;
      
      RETURN cleaned_count;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: cleanupSQL });
    
    if (error) {
      // Try direct execution if RPC doesn't work
      console.log('Cleanup function creation may need manual SQL execution.');
      console.log('Please run the following SQL in your Supabase SQL Editor:\n');
      console.log(cleanupSQL);
    } else {
      console.log('✅ Cleanup function created successfully.');
    }
  } catch (error) {
    console.log('Note: Manual function creation may be needed.');
  }
}

async function main() {
  console.log('🚀 Starting Permission Data Fix...\n');
  console.log('=====================================\n');

  try {
    // Step 1: Diagnose current issues
    const diagnosis = await diagnosePermissionIssues();

    // Step 2: Create cleanup function if needed
    await createCleanupFunction();

    // Step 3: Clean up if needed
    if (diagnosis.cleanupNeeded) {
      const cleanup = await cleanupOrphanedPermissions();
      
      // Step 4: Verify cleanup
      console.log('\n✅ Verification:');
      const finalCheck = await diagnosePermissionIssues();
      
      if (finalCheck.cleanupNeeded) {
        console.log('⚠️  Some orphaned permissions may still exist. Manual cleanup might be needed.');
      } else {
        console.log('🎉 All orphaned permissions have been successfully cleaned up!');
      }
    } else {
      console.log('🎉 No orphaned permissions found. Your database is clean!');
    }

    console.log('\n=====================================');
    console.log('✨ Permission Data Fix Complete!\n');
    
    console.log('Next Steps:');
    console.log('1. The "Permission data is missing for item" errors should now be resolved');
    console.log('2. Your application should function normally');
    console.log('3. Run your application to verify the fix\n');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
main().catch(console.error);