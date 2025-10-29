-- Simple Admin User Creation Script for Supabase
-- Run this in Supabase Studio SQL Editor or via psql

-- Step 1: Create the auth user
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@benirage.org',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Administrator","role":"admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING;
  
  -- Step 2: Create the profile
  INSERT INTO public.profiles (
    user_id,
    role,
    is_super_admin,
    is_active,
    full_name,
    cached_email,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'super-admin',
    true,
    true,
    'Super Administrator',
    'admin@benirage.org',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    role = 'super-admin',
    is_super_admin = true,
    is_active = true,
    full_name = 'Super Administrator',
    cached_email = 'admin@benirage.org',
    updated_at = NOW();
  
  RAISE NOTICE 'Admin user created successfully with ID: %', new_user_id;
  RAISE NOTICE 'Email: admin@benirage.org';
  RAISE NOTICE 'Password: admin123';
END $$;

-- Verify the user was created
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.is_super_admin,
  p.is_active
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'admin@benirage.org';