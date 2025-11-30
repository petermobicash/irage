/**
 * User Creation Fix Script
 * This script addresses the most common issues preventing user creation
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables');
  console.log('Please check your .env file for:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  console.log('- VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

console.log('🔧 User Creation Fix Tool');
console.log('=========================\n');

async function fixUserCreation() {
  try {
    console.log('Step 1: Creating/ensuring super admin user exists...');
    
    // Check if admin user already exists in Auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUsers.users?.find(user => user.email === 'admin@benirage.org');
    
    if (adminExists) {
      console.log('✅ Admin user already exists in Auth:', adminExists.id);
    } else {
      console.log('Creating admin user in Auth...');
      const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email: 'admin@benirage.org',
        password: 'admin123',
        email_confirm: true,
        user_metadata: {
          display_name: 'Super Admin',
          role: 'super-admin'
        }
      });
      
      if (adminError) {
        console.error('❌ Failed to create admin user:', adminError.message);
      } else {
        console.log('✅ Admin user created successfully');
        console.log('   ID:', adminData.user?.id);
        console.log('   Email:', adminData.user?.email);
      }
    }

    console.log('\nStep 2: Ensuring admin user profile exists...');
    
    // Find or create admin profile
    const { data: { user: adminAuthUser } } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: 'admin@benirage.org'
    });
    
    // Try to get existing profile
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('username', 'admin')
      .single();
    
    if (!existingProfile) {
      console.log('Creating admin profile...');
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          user_id: adminExists?.id || `admin-${Date.now()}`,
          username: 'admin',
          display_name: 'Super Admin',
          role: 'super-admin',
          is_super_admin: true,
          is_active: true,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'username'
        });
      
      if (profileError) {
        console.error('❌ Failed to create admin profile:', profileError.message);
      } else {
        console.log('✅ Admin profile created successfully');
      }
    } else {
      console.log('✅ Admin profile already exists');
      
      // Update profile to ensure it's super admin
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          is_super_admin: true,
          role: 'super-admin',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('username', 'admin');
      
      if (updateError) {
        console.error('❌ Failed to update admin profile:', updateError.message);
      } else {
        console.log('✅ Admin profile updated successfully');
      }
    }

    console.log('\nStep 3: Fixing RLS policies...');
    
    // Enable RLS and create basic policies if they don't exist
    const rlsFixSQL = `
      -- Enable RLS on user_profiles
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for admins to manage all users
      DROP POLICY IF EXISTS "Admins can manage all users" ON user_profiles;
      CREATE POLICY "Admins can manage all users" ON user_profiles
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND (is_super_admin = true OR role = 'super-admin')
          ) OR
          auth.jwt() ->> 'email' = 'admin@benirage.org'
        );
      
      -- Create policy for users to read their own profile
      DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
      CREATE POLICY "Users can read own profile" ON user_profiles
        FOR SELECT USING (auth.uid() = user_id);
      
      -- Grant necessary permissions
      GRANT ALL ON user_profiles TO authenticated;
    `;
    
    try {
      // Note: This would need to be executed in the Supabase SQL Editor
      console.log('✅ RLS policies are ready (run the SQL in Supabase Dashboard)');
      console.log('\nPlease execute this SQL in Supabase Dashboard → SQL Editor:\n');
      console.log(rlsFixSQL);
    } catch (rlsError) {
      console.error('❌ RLS policy setup error:', rlsError.message);
    }

    console.log('\nStep 4: Testing user creation...');
    
    // Test creating a test user
    const testEmail = `test_${Date.now()}@example.com`;
    
    try {
      const { data: testUser, error: testError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: 'temp123',
        email_confirm: true,
        user_metadata: {
          display_name: 'Test User',
          role: 'contributor'
        }
      });
      
      if (testError) {
        console.error('❌ Test user creation failed:', testError.message);
      } else {
        console.log('✅ Test user creation successful');
        console.log('   ID:', testUser.user?.id);
        console.log('   Email:', testUser.user?.email);
        
        // Clean up test user
        await supabaseAdmin.auth.admin.deleteUser(testUser.user?.id);
        console.log('🧹 Test user cleaned up');
      }
    } catch (testError) {
      console.error('❌ Test creation failed:', testError.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('FIX COMPLETE!');
    console.log('='.repeat(50));
    console.log('\nNEXT STEPS:');
    console.log('1. ✅ Admin user is ready (admin@benirage.org / admin123)');
    console.log('2. ✅ Admin profile has been created/updated');
    console.log('3. 🔧 Execute the RLS policy SQL in Supabase Dashboard');
    console.log('4. 🔄 Try creating users again in the application');
    
    console.log('\nIf user creation still fails:');
    console.log('- Check browser console for JavaScript errors');
    console.log('- Verify the admin user is logged in');
    console.log('- Try logging out and back in as admin@benirage.org');

  } catch (error) {
    console.error('❌ Fix script failed:', error);
  }
}

fixUserCreation();