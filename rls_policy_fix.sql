-- RLS Policy Fix for User Creation
-- Execute this in Supabase Dashboard → SQL Editor

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all users" ON user_profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON user_profiles;

-- Create comprehensive policy for user management
CREATE POLICY "Authenticated users can read all profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can do everything" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Allow super admins and admin@benirage.org to manage users
CREATE POLICY "Super admins can manage users" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (is_super_admin = true OR role = 'super-admin')
    )
    OR
    auth.jwt() ->> 'email' = 'admin@benirage.org'
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Ensure the admin user has proper permissions
UPDATE user_profiles 
SET 
  is_super_admin = true,
  role = 'super-admin',
  is_active = true
WHERE username = 'admin' OR display_name = 'Super Admin';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_super_admin ON user_profiles(is_super_admin);