/**
 * User Creation Diagnostic Script
 * This script helps identify issues with the super admin user creation process
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env file for:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

console.log('🔍 User Creation Diagnostic Tool');
console.log('================================\n');

async function runDiagnostics() {
  try {
    // Step 1: Check authentication
    console.log('Step 1: Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Authentication error:', authError.message);
      console.log('💡 Solution: Log in to the application first');
      return;
    }
    
    if (!user) {
      console.error('❌ No authenticated user found');
      console.log('💡 Solution: Log in to the application first');
      return;
    }
    
    console.log('✅ Authenticated as:', user.email);
    console.log('   User ID:', user.id);

    // Step 2: Check user permissions
    console.log('\nStep 2: Checking user permissions...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('username, is_super_admin, role')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile fetch error:', profileError.message);
      console.log('💡 This might be due to RLS policies or missing profile');
    } else {
      console.log('✅ User profile found:');
      console.log('   Username:', profile?.username);
      console.log('   Is Super Admin:', profile?.is_super_admin);
      console.log('   Role:', profile?.role);
    }

    // Check admin access
    const isAdmin = profile?.username === 'admin' || 
                    profile?.is_super_admin === true || 
                    user.email === 'admin@benirage.org';
    
    console.log('   Has admin access:', isAdmin ? '✅ YES' : '❌ NO');

    if (!isAdmin) {
      console.log('\n💡 To create super admin users, you need to:');
      console.log('   1. Log in as admin@benirage.org, OR');
      console.log('   2. Set is_super_admin = true in your user profile');
      return;
    }

    // Step 3: Test admin API access (if service role key is available)
    console.log('\nStep 3: Testing admin API access...');
    if (!supabaseAdmin) {
      console.log('⚠️  Service role key not available - testing with anon key');
    }

    try {
      // Test creating a test user
      const testEmail = `test_${Date.now()}@example.com`;
      const testPassword = 'temp123';
      
      console.log(`   Attempting to create test user: ${testEmail}`);
      
      const { data: authData, error: createError } = await (supabaseAdmin || supabase).auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          display_name: 'Test User',
          role: 'test'
        }
      });

      if (createError) {
        console.error('❌ Admin API error:', createError.message);
        console.log('💡 This indicates permission issues with the Supabase service role key');
        
        // Try fallback method
        console.log('\nStep 4: Testing fallback method...');
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            username: testEmail.split('@')[0],
            display_name: 'Test User (Fallback)',
            email: testEmail,
            role: 'contributor',
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('❌ Fallback method also failed:', insertError.message);
          console.log('💡 This indicates RLS policy or database permission issues');
        } else {
          console.log('✅ Fallback method worked - user invitation created');
        }
      } else {
        console.log('✅ Admin API worked successfully');
        console.log('   New user ID:', authData.user?.id);
        
        // Clean up test user
        if (supabaseAdmin && authData.user) {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          console.log('   🧹 Cleaned up test user');
        }
      }
    } catch (apiError) {
      console.error('❌ API test failed:', apiError.message);
    }

    // Step 4: Check database connection and tables
    console.log('\nStep 5: Checking database connection...');
    
    try {
      const { data, error: tableError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('❌ Database connection error:', tableError.message);
        console.log('💡 This might be due to RLS policies or missing tables');
      } else {
        console.log('✅ Database connection successful');
      }
    } catch (dbError) {
      console.error('❌ Database query failed:', dbError.message);
    }

    // Summary and recommendations
    console.log('\n' + '='.repeat(50));
    console.log('DIAGNOSTIC SUMMARY');
    console.log('='.repeat(50));
    
    if (isAdmin) {
      console.log('✅ Admin access confirmed');
    } else {
      console.log('❌ Admin access required');
    }
    
    if (supabaseAdmin) {
      console.log('✅ Service role key available');
    } else {
      console.log('❌ Service role key missing');
    }
    
    console.log('\nRECOMMENDED SOLUTIONS:');
    console.log('1. If admin access failed: Update user_profiles table to set is_super_admin = true');
    console.log('2. If API failed: Check Supabase service role key permissions');
    console.log('3. If database failed: Check RLS policies on user_profiles table');
    console.log('4. If all else fails: Use Supabase Dashboard to manually create users');

  } catch (error) {
    console.error('❌ Unexpected error during diagnostics:', error);
  }
}

// Run the diagnostics
runDiagnostics();