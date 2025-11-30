# HTTP 500 Errors Complete Solution

## Problem Analysis

Based on the network logs provided, there are multiple HTTP 500 errors occurring with Supabase API calls:

### Failing Endpoints (HTTP 500)
1. **user_profiles**: `?select=user_id&id=eq.new` (multiple requests)
2. **permissions**: `?select=id,name,slug,description,category,module,action,resource,is_system_permission,order_index,settings,is_active,created_at,updated_at,created_by,organization_id&order=order_index.asc,name.asc`
3. **user_profiles**: `?select=is_super_admin,admin_access_permissions,custom_permissions&user_id=eq.a16c2293-fbb0-48ac-9edb-796185e648a2`
4. **group_permissions**: Multiple queries with various group IDs

### Successful Endpoints (HTTP 200)
- `/auth/v1/user` - Authentication endpoint
- `/rest/v1/groups` - Groups endpoint
- `/rest/v1/groups?id=eq.[ID]` - Single group update

## Root Causes Identified

### 1. PostgreSQL Error Code 42P17 (Undefined Table)
The `user_profiles` table either:
- Does not exist in the remote Supabase database
- Is not accessible due to schema visibility issues
- Has RLS policies blocking access completely

### 2. Missing or Misconfigured Tables
- `permissions` table structure issues
- `group_permissions` table schema problems
- Incomplete foreign key relationships

### 3. RLS Policy Conflicts
- Multiple conflicting RLS policies causing infinite recursion
- Overly restrictive policies blocking legitimate access
- Schema visibility issues with function calls

## Complete Solution

### Step 1: Apply the Database Fix Script

Run the comprehensive database fix script in your Supabase SQL Editor:

```sql
-- Copy the entire content from database_diagnostic_and_fix.sql
-- and paste it into your Supabase SQL Editor, then execute
```

This script will:

1. **Diagnose Current State**: Check table existence and policy count
2. **Create Missing Tables**: Ensure all required tables exist
3. **Fix RLS Policies**: Remove conflicting policies and create permissive ones
4. **Add Performance Indexes**: Optimize query performance
5. **Insert Default Data**: Add necessary permissions and default records
6. **Create Helper Functions**: Add utility functions for permission checking
7. **Link Auth Users**: Sync existing auth.users with user_profiles
8. **Verify Results**: Confirm all tables and policies are correctly configured

### Step 2: Test the Previously Failing Endpoints

After applying the fix, test these specific endpoints that were returning 500 errors:

#### Test 1: User Profiles Query
```
GET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/user_profiles?select=user_id&id=eq.new
```
**Expected**: HTTP 200 (empty array or proper response)

#### Test 2: User Permissions Query  
```
GET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/user_profiles?select=is_super_admin,admin_access_permissions,custom_permissions&user_id=eq.a16c2293-fbb0-48ac-9edb-796185e648a2
```
**Expected**: HTTP 200 (user profile data)

#### Test 3: Permissions List Query
```
GET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/permissions?select=id,name,slug,description,category,module,action,resource,is_system_permission,order_index,settings,is_active,created_at,updated_at,created_by,organization_id&order=order_index.asc,name.asc
```
**Expected**: HTTP 200 (permissions list)

#### Test 4: Group Permissions Query
```
GET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/group_permissions?select=permission_id,permissions!inner(id,name,slug,description,category,module,action,resource,is_system_permission,order_index,settings,is_active,created_at,updated_at,created_by,organization_id)&group_id=eq.ce371441-6b72-4248-b2d3-a013210a15df
```
**Expected**: HTTP 200 (group permissions data)

### Step 3: Verification Queries

Run these diagnostic queries to verify the fix:

```sql
-- Check table existence and structure
SELECT 
    'user_profiles' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'permissions' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions' AND table_schema = 'public')
         THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'group_permissions' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_permissions' AND table_schema = 'public')
         THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Check record counts
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count
FROM public.user_profiles
UNION ALL
SELECT 
    'permissions' as table_name,
    COUNT(*) as record_count
FROM public.permissions
UNION ALL
SELECT 
    'group_permissions' as table_name,
    COUNT(*) as record_count
FROM public.group_permissions;

-- Check RLS policies
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'permissions', 'group_permissions')
GROUP BY tablename;
```

### Step 4: Monitor Application

1. **Reload your application** in the browser
2. **Check browser console** for any remaining errors
3. **Test user authentication** and profile loading
4. **Verify admin functionality** if applicable

## What This Fix Accomplishes

### ✅ Table Creation and Structure
- Creates `user_profiles` with all required columns
- Creates `permissions` with proper schema
- Creates `group_permissions` junction table
- Adds foreign key constraints and indexes

### ✅ RLS Policy Optimization
- Removes conflicting and problematic policies
- Creates permissive policies for basic functionality
- Adds service role access for administrative operations
- Prevents infinite recursion in policy evaluation

### ✅ Data Population
- Links existing auth.users to user_profiles
- Creates default permissions for basic functionality
- Sets up proper user roles and permissions
- Configures admin user access

### ✅ Performance Optimization
- Adds database indexes for fast queries
- Optimizes RLS policy evaluation
- Creates helper functions for permission checking
- Improves query execution plans

## Prevention Measures

To prevent similar issues in the future:

1. **Always test API endpoints** after applying migrations
2. **Use proper schema prefixes** (e.g., `public.table_name`)
3. **Implement automated health checks** for critical tables
4. **Monitor RLS policy performance** and conflicts
5. **Use staging environments** to test database changes
6. **Document schema requirements** for each table

## Troubleshooting

If issues persist after applying the fix:

1. **Check SQL Editor logs** for any error messages
2. **Verify table creation** with the verification queries above
3. **Test with service role key** to rule out RLS issues
4. **Check network tab** in browser for detailed error messages
5. **Restart Supabase session** if needed

## Expected Results

After applying this fix, you should see:

- ✅ All HTTP 500 errors resolved
- ✅ User profiles loading correctly
- ✅ Permissions system working
- ✅ Group-based access control functional
- ✅ Admin dashboard accessible
- ✅ No more 42P17 errors
- ✅ Proper user authentication flow

The network logs should now show HTTP 200 responses for all previously failing endpoints, and the application should load and function normally.