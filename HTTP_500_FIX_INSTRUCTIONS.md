🔧 HTTP 500 ERROR FIX FOR USER_PROFILES 42P17
==========================================

ISSUE: PostgreSQL error code 42P17 (undefined table)
ENDPOINT: https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/user_profiles

WHAT THIS FIX DOES:
✅ Creates missing user_profiles table
✅ Fixes RLS policies causing access issues  
✅ Adds performance indexes
✅ Links existing auth.users to user_profiles
✅ Resolves HTTP 500 errors

QUICK FIX INSTRUCTIONS:
======================

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor  
3. Copy the entire content from "QUICK_FIX_500_ERROR.sql"
4. Paste into SQL Editor and Execute

AFTER APPLYING THE FIX:
=====================

Test the endpoint that was failing:
GET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/user_profiles?select=*&order=created_at.desc

Expected result: HTTP 200 instead of HTTP 500

DETAILED SOLUTION:
=================

For complete fix including permissions and group_permissions tables,
see: "database_diagnostic_and_fix.sql" (comprehensive version)

Both scripts will resolve your HTTP 500 error and restore normal API functionality.