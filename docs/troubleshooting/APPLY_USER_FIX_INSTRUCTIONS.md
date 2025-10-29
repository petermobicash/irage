# How to Apply the User Roles and Groups Fix

## Quick Start - Via Supabase Dashboard (Recommended)

Since you're not logged in to Supabase CLI, use the dashboard method:

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **New Query** button
2. Copy the entire contents of `supabase/migrations/076_ensure_users_have_roles_and_groups.sql`
3. Paste it into the SQL editor
4. Click **Run** button (or press Ctrl+Enter / Cmd+Enter)

### Step 3: Verify the Results
You should see output messages like:
```
✅ Updated user_profiles to ensure all users have valid roles
✅ Ensured default groups exist
✅ Assigned X users to their appropriate groups
✅ Ensured all users have at least one group membership
✅ Created user_roles_and_groups view for easy verification

========================================
USER ROLES AND GROUPS VERIFICATION
========================================
Total Users: 4
Users with Roles: 4 (100.0%)
Users with Groups: 4 (100.0%)
Users without Groups: 0
Total Active Groups: 8
Total Group Memberships: 4
```

### Step 4: Verify User Assignments
Run this query in the SQL Editor to see all users with their roles and groups:
```sql
SELECT * FROM user_roles_and_groups;
```

## Alternative: Login to Supabase CLI

If you prefer using the CLI:

### Option A: Login with Access Token
```bash
supabase login
```
This will open a browser window for authentication.

### Option B: Use Environment Variable
```bash
# Get your access token from https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="your-access-token-here"
supabase db push
```

### Option C: Direct Migration
```bash
# After logging in
supabase migration up
```

## What This Fix Does

The migration will:
1. ✅ Assign roles to all users (default: 'contributor')
2. ✅ Create 8 default system groups
3. ✅ Automatically assign users to groups based on their roles
4. ✅ Ensure no user is left without a group
5. ✅ Create a verification view for easy checking

## Verification Queries

After running the migration, verify with these queries:

### Check all users and their groups
```sql
SELECT * FROM user_roles_and_groups;
```

### Check group membership counts
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

### Check users without groups (should return 0)
```sql
SELECT COUNT(*) as users_without_groups
FROM user_profiles up 
WHERE user_id IS NOT NULL 
AND NOT EXISTS (
    SELECT 1 FROM group_users gu 
    WHERE gu.user_id = up.user_id AND gu.is_active = true
);
```

## Troubleshooting

### If you see errors:
1. **Permission denied**: Make sure you're logged in as the project owner
2. **Table already exists**: The migration handles this with `IF NOT EXISTS`
3. **No users found**: Check if `user_profiles` table has data

### If users still don't have groups:
Run this manual fix:
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

## Next Steps

After applying the fix:
1. ✅ All 4 users will have roles assigned
2. ✅ All 4 users will be members of appropriate groups
3. ✅ You can manage users via the User Management interface at `/user-management`
4. ✅ Group-based permissions will work correctly

## Support

For issues:
- Check the full documentation in `USER_ROLES_AND_GROUPS_FIX.md`
- Review Supabase logs for detailed error messages
- Contact admin@benirage.org for assistance