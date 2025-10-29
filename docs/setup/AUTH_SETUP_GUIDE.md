# Authentication Setup & Troubleshooting Guide

## 🔍 Current Issues Identified

Based on the analysis of your authentication system, here are the main issues:

### 1. **Supabase Configuration is Correct** ✅
- Local Supabase is running on `http://127.0.0.1:54321`
- Keys in `.env` are correct for local development
- Database is accessible

### 2. **Missing Admin User** ⚠️
The main issue is that **no admin user exists in the Supabase Auth system**. You need to create one.

### 3. **Session Persistence Disabled** ⚠️
In [`src/lib/supabase.ts:16-19`](src/lib/supabase.ts:16), session persistence is disabled:
```typescript
auth: {
  persistSession: false,  // ❌ This prevents login persistence
  autoRefreshToken: false,
  detectSessionInUrl: false
}
```

## 🛠️ Quick Fix Steps

### Step 1: Enable Session Persistence

Update the Supabase client configuration in [`src/lib/supabase.ts`](src/lib/supabase.ts):

```typescript
export const supabase = createClient(supabaseUrl || 'https://dummy.supabase.co', supabaseAnonKey || 'dummy-key', {
  auth: {
    persistSession: true,      // ✅ Enable session persistence
    autoRefreshToken: true,    // ✅ Enable auto token refresh
    detectSessionInUrl: true   // ✅ Enable URL session detection
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'benirage-website',
      'apikey': supabaseAnonKey || ''
    }
  }
});
```

### Step 2: Create Admin User

You have two options:

#### Option A: Using Supabase Studio (Recommended)
1. Open Supabase Studio: http://127.0.0.1:54323
2. Go to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Fill in:
   - **Email**: `admin@benirage.org`
   - **Password**: `admin123` (or your preferred password)
   - **Auto Confirm User**: ✅ Check this box
5. Click **Create user**

#### Option B: Using SQL
Run this in Supabase Studio SQL Editor or via psql:

```sql
-- Create admin user in auth.users
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
  gen_random_uuid(),
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
);
```

### Step 3: Create User Profile

After creating the auth user, create a profile:

```sql
-- Get the user_id from the created user
WITH new_user AS (
  SELECT id FROM auth.users WHERE email = 'admin@benirage.org'
)
INSERT INTO public.profiles (
  user_id,
  role,
  is_super_admin,
  is_active,
  full_name,
  cached_email
)
SELECT 
  id,
  'super-admin',
  true,
  true,
  'Super Administrator',
  'admin@benirage.org'
FROM new_user;
```

## 🔐 Login Credentials

After setup, use these credentials:

- **Email**: `admin@benirage.org`
- **Password**: `admin123` (or what you set)

**Development Bypass**: The app also has a hardcoded bypass in [`LoginForm.tsx:23-34`](src/components/auth/LoginForm.tsx:23) that works with:
- **Email**: `admin@benirage.org`
- **Password**: `password123`

## 🧪 Testing Authentication

### Test 1: Check Supabase Connection
```bash
curl http://127.0.0.1:54321/rest/v1/ \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"
```

### Test 2: List Users
```bash
curl "http://127.0.0.1:54321/auth/v1/admin/users" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Authorization: Bearer sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz"
```

### Test 3: Try Login
1. Start the dev server: `npm run dev`
2. Navigate to: http://localhost:5173/admin
3. Enter credentials
4. Check browser console for any errors

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid login credentials"
**Cause**: User doesn't exist in auth.users table
**Solution**: Create the user using Step 2 above

### Issue 2: "Unable to create or load user profile"
**Cause**: Profile doesn't exist in profiles table
**Solution**: Run the profile creation SQL from Step 3

### Issue 3: "Auth session missing"
**Cause**: Session persistence is disabled
**Solution**: Enable session persistence (Step 1)

### Issue 4: "RLS Policy Violation"
**Cause**: Row Level Security policies blocking access
**Solution**: Check RLS policies:
```sql
-- Disable RLS temporarily for testing (NOT for production!)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Or create proper policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### Issue 5: Session not persisting after refresh
**Cause**: `persistSession: false` in supabase config
**Solution**: Set to `true` as shown in Step 1

## 📝 Additional Configuration

### For Production Deployment

When deploying to production, you'll need to:

1. **Get Production Supabase Credentials**:
   - Go to https://supabase.com/dashboard
   - Create a new project or use existing
   - Get your project URL and anon key from Settings → API

2. **Update `.env` for Production**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

3. **Create Admin User in Production**:
   - Use Supabase Dashboard → Authentication → Users
   - Or use the Supabase CLI: `supabase db push`

## 🔄 Reset Everything (If Needed)

If you want to start fresh:

```bash
# Stop Supabase
supabase stop

# Reset database
supabase db reset

# Start again
supabase start

# Then recreate admin user
```

## 📚 Related Files

- [`src/lib/supabase.ts`](src/lib/supabase.ts) - Supabase client configuration
- [`src/components/auth/LoginForm.tsx`](src/components/auth/LoginForm.tsx) - Login form component
- [`src/components/auth/ProtectedRoute.tsx`](src/components/auth/ProtectedRoute.tsx) - Route protection
- [`src/utils/auth.ts`](src/utils/auth.ts) - Authentication utilities
- [`.env`](.env) - Environment configuration

## 🆘 Still Having Issues?

1. Check Supabase logs: `supabase logs`
2. Check browser console for errors
3. Verify Supabase is running: `supabase status`
4. Check database connection: `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres`

---

**Last Updated**: 2025-10-29
**Status**: Ready for implementation