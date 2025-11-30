-- Quick Fix: Create Super Admin User Profile
-- Run this SQL in your Supabase Dashboard → SQL Editor

-- First, check if admin user profile exists
SELECT username, display_name, role, is_super_admin 
FROM user_profiles 
WHERE username = 'admin' OR display_name = 'Super Admin';

-- Create admin profile if it doesn't exist
INSERT INTO user_profiles (
  user_id,
  username, 
  display_name, 
  role, 
  is_super_admin, 
  is_active,
  status,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'admin',
  'Super Admin',
  'super-admin',
  true,
  true,
  'active',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE username = 'admin'
);

-- Update existing admin profile to ensure super admin status
UPDATE user_profiles 
SET 
  is_super_admin = true,
  role = 'super-admin',
  is_active = true,
  updated_at = now()
WHERE username = 'admin';

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Verify the fix worked
SELECT 'Admin user profile:' as status, username, display_name, role, is_super_admin 
FROM user_profiles 
WHERE username = 'admin';

-- Final verification message
SELECT '✅ Admin user setup complete! Now log in as admin@benirage.org and try creating users again.' as message;