-- Fix Admin User Permissions
-- This script updates the admin user to have super admin permissions

-- Update the admin user in the users table
UPDATE users 
SET 
  role = 'super_admin',
  is_super_admin = true,
  updated_at = NOW()
WHERE email = 'admin@benirage.org' 
  AND user_id IS NOT NULL;

-- Verify the update
SELECT 
  id,
  user_id,
  name,
  email,
  role,
  is_super_admin,
  is_active,
  created_at
FROM users 
WHERE email = 'admin@benirage.org' 
  AND user_id IS NOT NULL;

-- Show message
DO $$
BEGIN
  RAISE NOTICE '✅ Admin user permissions updated successfully!';
  RAISE NOTICE '📧 Email: admin@benirage.org';
  RAISE NOTICE '🔑 Role: super_admin';
  RAISE NOTICE '⭐ Super Admin: true';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Please log out and log back in for changes to take effect.';
END $$;