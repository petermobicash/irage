# User Profiles 42P17 Error - Complete Solution

## Problem

The error `ERROR: 42710: policy "authenticated_select_all_profiles" for table "user_profiles" already exists` occurs when trying to run the `fix_user_profiles_42p17_error.sql` script. This happens because the policy already exists from a previous run of the script.

## Root Cause

1. The SQL script tries to create a Row Level Security (RLS) policy named `"authenticated_select_all_profiles"`
2. If this script was run before (even partially), the policy was created successfully
3. Running the script again attempts to create the same policy, causing PostgreSQL to throw a 42710 error (object already exists)

## Solution Applied

I've updated the `fix_user_profiles_42p17_error.sql` script to fix two issues:

### Issue 1: Policy Already Exists (42P10 Error)
**Problem:** The script tried to create policies that already existed.

**Fix:** Added proper DROP statements before CREATE statements:
```sql
-- Drop ALL existing policies including the one causing the conflict
DROP POLICY IF EXISTS "authenticated_select_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "anonymous_select_all_profiles" ON public.user_profiles;
-- ... include all policy names
CREATE POLICY "authenticated_select_all_profiles" -- ✅ Works!
```

### Issue 2: Invalid SQL Syntax (42P01 Error)  
**Problem:** The INSERT...ON CONFLICT clause referenced table alias `au` which isn't accessible in that context.

**Fixed syntax:**
```sql
-- Before (causing 42P01 error):
ON CONFLICT (user_id) DO UPDATE SET
    username = COALESCE(EXCLUDED.username, split_part(au.email, '@', 1)),
    email = au.email;

-- After (fixed):
ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email;
```

**Key:** In PostgreSQL's ON CONFLICT clause, you can only use:
- `EXCLUDED` - the row that was attempted to be inserted
- Table column names - columns from the target table

## How to Use the Fixed Script

### Option 1: Run in Supabase SQL Editor
1. Open your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of the fixed `fix_user_profiles_42p17_error.sql`
4. Paste and run the script
5. You should see success messages indicating the table, policies, indexes, and triggers were created

### Option 2: Apply via Migration
If you have migrations set up:
```bash
# Copy the fixed script to your migrations folder
cp fix_user_profiles_42p17_error.sql supabase/migrations/
# Apply migrations
supabase db push
```

## What the Script Does

1. **Creates user_profiles table** - Ensures the table exists with all necessary columns
2. **Enables Row Level Security** - Protects the table with RLS policies
3. **Creates permissive policies** - Allows authenticated users to view all profiles, users to manage their own profiles
4. **Creates performance indexes** - Optimizes queries on user_profiles
5. **Sets up sync trigger** - Automatically creates profiles when users sign up
6. **Links existing users** - Creates profiles for users already in auth.users

## Expected Output

When successful, you should see messages like:
```
========================================
USER_PROFILES 42P17 ERROR FIX COMPLETED
========================================
✅ user_profiles table EXISTS in public schema
✅ Created 5 RLS policies for user_profiles
✅ Linked 15 profiles to 15 auth users
✅ Created 15 user records
✅ Created performance indexes
✅ Set up sync trigger for new users

The 42P17 error should now be resolved!
Test the API call again:
GET /rest/v1/user_profiles?select=*&user_id=eq.[USER_ID]
========================================
```

## Verification

After running the fix, test that the API works:
```bash
curl -X GET 'https://your-project.supabase.co/rest/v1/user_profiles?select=*' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Prevention

To avoid this issue in the future:
1. Always use `DROP POLICY IF EXISTS` before `CREATE POLICY`
2. Include all policy names in the DROP statements, not just a subset
3. Test scripts on a development database first
4. Consider using transaction blocks (`BEGIN; ... COMMIT;`) to ensure atomic operations

## Alternative Solutions

If the script still fails:

### Option 1: Manual Cleanup
```sql
-- Manually drop all policies
DROP POLICY IF EXISTS "authenticated_select_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "anonymous_select_all_profiles" ON public.user_profiles;
-- Continue with other policies...
-- Then run the CREATE POLICY statements
```

### Option 2: Check Existing Policies
```sql
-- See what policies already exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

## Files Modified

- `fix_user_profiles_42p17_error.sql` - Updated to include all policy drops before creations

## Related Files

- `supabase/migrations/113_fix_user_profiles_rls_for_content.sql` - Original RLS policies
- `supabase/migrations/114_fix_all_search_paths_for_user_profiles.sql` - Function fixes
- `USER_PROFILES_42P17_ERROR_FIX.md` - Previous documentation

The fix ensures your user_profiles table is properly configured with RLS policies that allow your application to function correctly while maintaining security.