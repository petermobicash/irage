# Security Fix Migration Guide

## Overview
This guide covers the migration `116_security_fixes.sql` that resolves critical security issues identified in the database linter.

## Issues Resolved

### 1. Security Definer Views (ERROR)
- **Affected Views**: 
  - `public.user_statistics_view`
  - `public.user_management_view` 
  - `public.active_users_summary`
- **Problem**: Views were defined with SECURITY DEFINER, using creator's permissions instead of querying user's permissions
- **Solution**: Converted to SECURITY INVOKER

### 2. RLS Disabled in Public (ERROR)
- **Affected Table**: `public.policy_backup`
- **Problem**: Table in public schema without Row Level Security enabled
- **Solution**: Enabled RLS with appropriate policies

## Migration Details

### Changes Made

#### 1. View Security Model Changes
```sql
-- OLD: SECURITY DEFINER (uses view creator's permissions)
-- NEW: SECURITY INVOKER (uses querying user's permissions)

-- Create view normally
CREATE OR REPLACE VIEW public.user_statistics_view AS
-- ... view definition

-- Then set security property
ALTER VIEW public.user_statistics_view SET (security_invoker = true);

-- Repeat for other views
CREATE OR REPLACE VIEW public.user_management_view AS
-- ... view definition

ALTER VIEW public.user_management_view SET (security_invoker = true);

CREATE OR REPLACE VIEW public.active_users_summary AS
-- ... view definition

ALTER VIEW public.active_users_summary SET (security_invoker = true);
```

#### 2. RLS on policy_backup Table
```sql
-- Enable RLS
ALTER TABLE public.policy_backup ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to view policy_backup" ON public.policy_backup
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow service role full access to policy_backup" ON public.policy_backup
    FOR ALL TO service_role USING (true) WITH CHECK (true);
```

## Testing Instructions

### 1. Local Testing (Recommended)
```bash
# Apply migration to local Supabase
supabase db reset
supabase migration up

# Or run specific migration
supabase db push
```

### 2. Development Environment Testing
```bash
# Connect to development database and test
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" -f supabase/migrations/116_security_fixes.sql
```

### 3. Verification Queries
Run these queries to verify the fixes:

```sql
-- Check view security type
SELECT 
    table_name,
    security_type
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('user_statistics_view', 'user_management_view', 'active_users_summary');

-- Check RLS status on policy_backup
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'policy_backup';

-- Check RLS policies on policy_backup
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'policy_backup';
```

## Expected Results

### View Security Verification
```
table_name              | security_type
------------------------|--------------
user_statistics_view    | INVOKER
user_management_view    | INVOKER  
active_users_summary    | INVOKER
```

### RLS Verification
```
tablename       | rowsecurity
----------------|-------------
policy_backup   | t
```

### Policy Verification
```
policyname                              | cmd | roles
----------------------------------------|-----|-------------
Allow authenticated users to view       | SELECT | {authenticated}
Allow service role full access          | ALL    | {service_role}
```

## Production Deployment

### 1. Backup Current Database
```bash
# Create backup before applying
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Apply Migration
```bash
# Via Supabase CLI
supabase migration up

# Or direct SQL execution
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" -f supabase/migrations/116_security_fixes.sql
```

### 3. Verify in Production
```sql
-- Run verification queries from testing section
-- Check application functionality
-- Test API endpoints that use the views
```

## Rollback Plan

If issues occur, use the rollback procedure included in the migration file:

```sql
-- Run the rollback section from the migration file
-- (See comments at bottom of 116_security_fixes.sql)
```

## Impact Assessment

### Positive Impacts
- ✅ Eliminates security vulnerabilities
- ✅ Ensures proper permission enforcement
- ✅ Improves audit trail with security_events logging
- ✅ Maintains backward compatibility for legitimate use cases

### Potential Impacts
- ⚠️ Views now use querying user's permissions - verify this doesn't break intended functionality
- ⚠️ policy_backup table now has RLS - ensure existing code handles this correctly
- ⚠️ Service role access unchanged for administrative functions

### Testing Checklist
- [ ] Verify all views return expected data
- [ ] Test with different user roles (authenticated users)
- [ ] Verify policy_backup table access patterns
- [ ] Test API endpoints that query the views
- [ ] Check application functionality is not affected
- [ ] Verify service role still has appropriate access

## Security Benefits

1. **Principle of Least Privilege**: Views now enforce the querying user's permissions
2. **Data Protection**: policy_backup table is now properly protected with RLS
3. **Audit Trail**: Security events are logged for compliance
4. **Consistency**: All security issues from the linter are resolved

## Post-Deployment

1. **Monitor application logs** for any permission-related errors
2. **Run security scan** again to confirm issues are resolved
3. **Update security documentation** to reflect the changes
4. **Train team** on the new security model for views

## Support

If issues arise during deployment:
1. Check the rollback procedure in the migration file
2. Review application logs for permission errors
3. Verify user roles and permissions in the database
4. Test with service role to isolate permission issues

---

**Migration File**: `supabase/migrations/116_security_fixes.sql`  
**Date Created**: 2025-11-20  
**Priority**: HIGH (Security Issue)  
**Estimated Downtime**: None (should be instant)