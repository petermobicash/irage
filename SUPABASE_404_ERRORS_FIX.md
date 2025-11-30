# Supabase 404 Errors Fix - Complete Solution

## Problem Summary

The application is experiencing HTTP 404 errors when trying to access these Supabase tables:

- `content_locks` - For content editing locks
- `content_analytics` - For tracking content metrics  
- `content_revisions` - For content version history

**Error Messages:**
```
XHRGET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/content_locks?select=*&content_id=eq.2685d53f-f885-43c5-95db-00dc122c2af5&expires_at=gt.2025-11-25T18:14:56.439Z
[HTTP/2 404  400ms]

XHRGET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/content_analytics?select=*&content_id=eq.2685d53f-f885-43c5-95db-00dc122c2af5
[HTTP/2 404  387ms]

XHRGET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/content_revisions?select=*&content_id=eq.2685d53f-f885-43c5-95db-00dc122c2af5&order=version_number.desc
[HTTP/2 404  809ms]
```

## Root Cause

These tables are **defined in the TypeScript types** in `src/lib/supabase.ts` but **don't exist in the actual Supabase database**. This mismatch causes the API endpoints to return 404 Not Found errors.

The application expects these tables for:
- **Content Locking**: Preventing simultaneous edits by multiple users
- **Analytics**: Tracking content views, engagement, and user interactions
- **Revisions**: Maintaining version history of content changes

## Solution Created

### 1. Database Schema Fix (`create_missing_content_tables.sql`)

Created comprehensive SQL migration that:

- ✅ Creates all 3 missing tables with proper structure
- ✅ Sets up Row Level Security (RLS) policies for data protection
- ✅ Creates performance indexes for fast queries
- ✅ Implements helper functions for content locking
- ✅ Adds automatic revision creation triggers
- ✅ Provides cleanup functions for expired locks

### 2. Automated Application Script (`apply_content_tables_fix.js`)

Node.js script that:
- ✅ Checks which tables exist vs missing
- ✅ Applies the SQL migration automatically
- ✅ Verifies the fix was successful
- ✅ Provides manual instructions if needed

## How to Apply the Fix

### Method 1: Automatic (Recommended)

```bash
# Install dependencies (if needed)
npm install @supabase/supabase-js dotenv

# Run the fix script
node apply_content_tables_fix.js
```

The script will:
1. Check your current database state
2. Apply the SQL migration automatically
3. Verify all tables are created
4. Confirm the fix worked

### Method 2: Manual (Alternative)

If the automatic script doesn't work, follow these steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project
   - Open **SQL Editor**

2. **Run the Migration**
   - Copy the entire content of `create_missing_content_tables.sql`
   - Paste into the SQL Editor
   - Click **Run** to execute

3. **Verify Success**
   - The output should show success messages
   - Tables should appear in the Table Editor

## What's Included in the Fix

### Tables Created

#### 1. `content_locks`
```sql
- id: UUID (Primary Key)
- content_id: UUID (Foreign Key to content)
- locked_by: TEXT (User who locked)
- locked_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ
- lock_type: TEXT
- session_id: TEXT
- locked_by_id: UUID (Auth user)
```

#### 2. `content_analytics`
```sql
- id: UUID (Primary Key)
- content_id: UUID (Foreign Key)
- metric_type: TEXT (view, click, share, etc.)
- metric_value: INTEGER
- user_id: TEXT
- session_id: TEXT
- ip_address: INET
- user_agent: TEXT
- recorded_at: TIMESTAMPTZ
```

#### 3. `content_revisions`
```sql
- id: UUID (Primary Key)
- content_id: UUID (Foreign Key)
- revision_number: INTEGER
- title: TEXT
- content: TEXT
- excerpt: TEXT
- changes_summary: TEXT
- created_by: TEXT
- created_at: TIMESTAMPTZ
- is_current: BOOLEAN
- diff_data: JSONB
```

### Helper Functions

- **`get_content_lock(content_id)`** - Check active content lock
- **`acquire_content_lock(content_id, user, type, duration)`** - Lock content for editing
- **`release_content_lock(content_id, user)`** - Release content lock
- **`cleanup_expired_content_locks()`** - Clean up expired locks

### Automatic Features

- **Content Revision Triggers**: Automatically creates revision records when content changes
- **Lock Cleanup**: Expired locks are automatically removed
- **Performance Indexes**: Optimized database queries

## Expected Results After Fix

✅ **No More 404 Errors**: All content-related API calls will succeed
✅ **Content Locking**: Users can lock content during editing to prevent conflicts
✅ **Analytics Tracking**: Content performance metrics will be recorded
✅ **Revision History**: Full content version history with change tracking
✅ **Better Collaboration**: Multiple users can safely work on content

## Security Features

- **Row Level Security (RLS)**: Data access is properly restricted
- **User Authentication**: Only authenticated users can modify locks and revisions
- **Anonymous Read Access**: Public content analytics can be viewed by anyone
- **Service Role Access**: Administrative functions have proper permissions

## Testing the Fix

After applying the fix, you can test:

1. **Content Locking**
   ```javascript
   // This should work without 404 error
   const { data, error } = await supabase
     .from('content_locks')
     .select('*')
     .eq('content_id', 'your-content-id');
   ```

2. **Content Analytics**
   ```javascript
   // This should work without 404 error
   const { data, error } = await supabase
     .from('content_analytics')
     .select('*')
     .eq('content_id', 'your-content-id');
   ```

3. **Content Revisions**
   ```javascript
   // This should work without 404 error
   const { data, error } = await supabase
     .from('content_revisions')
     .select('*')
     .eq('content_id', 'your-content-id')
     .order('revision_number', { ascending: false });
   ```

## Troubleshooting

### If Tables Still Don't Appear

1. **Check Supabase Logs**: Look for any migration errors in the SQL Editor
2. **Verify Permissions**: Ensure you have database admin access
3. **Clear Cache**: Try refreshing the Supabase dashboard
4. **Manual Check**: Run this SQL to verify:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('content_locks', 'content_analytics', 'content_revisions');
   ```

### If Functions Don't Work

The helper functions should be automatically available. If you get function not found errors:

1. **Re-run Migration**: The functions might not have been created properly
2. **Check Grants**: Ensure proper permissions are granted

### Still Getting 404s

If you still see 404 errors after the fix:

1. **Hard Refresh Browser**: Clear cache and reload
2. **Restart Development Server**: Stop and restart your dev server
3. **Check API Key**: Ensure you're using the correct anon key
4. **Verify Network**: Check browser network tab for detailed errors

## Next Steps

1. **Apply the fix** using one of the methods above
2. **Test your application** to confirm 404 errors are gone
3. **Monitor the logs** to ensure everything works correctly
4. **Enjoy improved functionality** with content locking, analytics, and revisions!

---

**Created by**: Kilo Code Assistant  
**Date**: 2025-11-25  
**Version**: 1.0

This fix resolves the database schema mismatch and provides a robust foundation for content management features.