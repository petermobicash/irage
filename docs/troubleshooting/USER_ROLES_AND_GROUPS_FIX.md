# User Roles and Groups Fix

## Overview
This document explains the fix applied to ensure all users in the system have proper roles and group assignments.

## Problem Identified
The user management system had users without:
1. **Assigned roles** in the `user_profiles` table
2. **Group memberships** in the `group_users` table

## Solution Implemented

### Migration Script: `076_ensure_users_have_roles_and_groups.sql`

This migration script performs the following actions:

#### 1. Role Assignment
- Updates all `user_profiles` without a role to have 'contributor' as default
- Converts generic 'user' role to more descriptive 'contributor' role
- Ensures every user has a valid role assigned

#### 2. Default Groups Creation
Creates/updates 8 default system groups:
- **Super Administrators** - Full system access
- **Administrators** - Administrative access
- **Content Managers** - Content and media management
- **Editors** - Content editing and publishing
- **Contributors** - Create and edit own content
- **Reviewers** - Review and approve content
- **Regular Users** - Standard user access
- **Guests** - Limited read-only access

#### 3. Automatic Group Assignment
- Maps users to groups based on their roles:
  - `super-admin` or `is_super_admin=true` → Super Administrators
  - `admin` → Administrators
  - `content-manager` → Content Managers
  - `editor` → Editors
  - `contributor` → Contributors
  - `reviewer` → Reviewers
  - `viewer` → Guests
  - Others → Regular Users

#### 4. Fallback Assignment
- Ensures users without any group membership are assigned to "Regular Users"
- Prevents any user from being without a group

#### 5. Verification View
Creates `user_roles_and_groups` view for easy verification:
```sql
SELECT * FROM user_roles_and_groups;
```

This view shows:
- User ID, username, display name
- Assigned role
- Super admin status
- Active status
- All groups (as JSON array)
- Group count

## How to Apply the Fix

### Option 1: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/076_ensure_users_have_roles_and_groups.sql`
4. Paste and run the script
5. Check the output messages for verification statistics

### Option 2: Via Supabase CLI
```bash
# If using Supabase CLI
supabase db push

# Or apply specific migration
supabase migration up
```

## Verification

After running the migration, verify the results:

### Check User Roles and Groups
```sql
SELECT * FROM user_roles_and_groups
ORDER BY created_at DESC;
```

### Check Statistics
```sql
-- Total users
SELECT COUNT(*) as total_users FROM user_profiles WHERE user_id IS NOT NULL;

-- Users with roles
SELECT COUNT(*) as users_with_roles 
FROM user_profiles 
WHERE user_id IS NOT NULL AND role IS NOT NULL AND role != '';

-- Users with groups
SELECT COUNT(DISTINCT user_id) as users_with_groups 
FROM group_users 
WHERE is_active = true;

-- Users without groups (should be 0)
SELECT COUNT(*) as users_without_groups
FROM user_profiles up 
WHERE user_id IS NOT NULL 
AND NOT EXISTS (
    SELECT 1 FROM group_users gu 
    WHERE gu.user_id = up.user_id AND gu.is_active = true
);
```

### Check Group Memberships
```sql
SELECT 
    g.name as group_name,
    COUNT(gu.user_id) as member_count
FROM groups g
LEFT JOIN group_users gu ON g.id = gu.group_id AND gu.is_active = true
WHERE g.is_active = true
GROUP BY g.id, g.name
ORDER BY member_count DESC;
```

## Expected Results

After running the migration, you should see:
- ✅ All users have valid roles assigned
- ✅ All users are members of at least one group
- ✅ Group assignments match user roles
- ✅ Statistics showing 100% coverage for roles and groups

## User Management Interface

The existing user management interface at [`src/components/cms/UserManager.tsx`](src/components/cms/UserManager.tsx:104) already supports:
- Viewing user roles and groups
- Assigning users to multiple groups
- Managing group memberships
- Bulk operations for group assignments

## Related Files

### Database Schema
- [`supabase/migrations/065_add_group_permissions_tables.sql`](supabase/migrations/065_add_group_permissions_tables.sql:1) - Groups and permissions tables
- [`supabase/migrations/067_fix_user_profiles_relation_error.sql`](supabase/migrations/067_fix_user_profiles_relation_error.sql:1) - User profiles table

### Application Code
- [`src/components/cms/UserManager.tsx`](src/components/cms/UserManager.tsx:1) - User management UI
- [`src/utils/groupRBAC.ts`](src/utils/groupRBAC.ts:1) - Group-based RBAC utilities
- [`src/pages/UserManagement.tsx`](src/pages/UserManagement.tsx:1) - User management page

## Troubleshooting

### If users still don't have groups:
1. Check if the groups table has active groups:
   ```sql
   SELECT * FROM groups WHERE is_active = true;
   ```

2. Manually assign users to groups:
   ```sql
   INSERT INTO group_users (group_id, user_id, assigned_by, is_active)
   SELECT 
       (SELECT id FROM groups WHERE name = 'Regular Users' LIMIT 1),
       user_id,
       'manual-fix',
       true
   FROM user_profiles
   WHERE user_id IS NOT NULL
   ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
   ```

### If roles are not assigned:
```sql
UPDATE user_profiles
SET role = 'contributor'
WHERE role IS NULL OR role = '';
```

## Future Enhancements

Consider implementing:
1. **Automatic role-to-group sync** - Trigger that updates group membership when role changes
2. **Role hierarchy** - Define role inheritance for permission management
3. **Custom groups** - Allow admins to create custom groups beyond system defaults
4. **Group permissions** - Fine-grained permission assignment per group

## Support

For issues or questions:
- Check the Supabase logs for error messages
- Review the RLS policies on `user_profiles`, `groups`, and `group_users` tables
- Contact admin@benirage.org for assistance