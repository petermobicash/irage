# XHR PATCH 400 Error Solution

## Problem Summary

**Failing Request:**
```
XHRPATCH
https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/user_profiles?user_id=eq.a16c2293-fbb0-48ac-9edb-796185e648a2
[HTTP/3 400  349ms]
```

This is a PATCH request to update a user profile that returns a 400 Bad Request error.

## Root Cause Analysis

The 400 error is most likely caused by one or more of these issues:

### 1. **Schema Mismatch**
The frontend code (UserOnboarding.tsx) attempts to update fields that don't exist in the user_profiles table:
- `name`
- `full_name` 
- `profile_completed`
- `onboarding_completed`
- `onboarding_completed_at`
- `notification_preferences`

### 2. **RLS Policy Issues**
Row Level Security policies may be preventing the PATCH operation due to:
- Circular references in policy functions
- Incorrect user matching logic
- Missing policies for authenticated users

### 3. **Missing User Profile**
The target user (a16c2293-fbb0-48ac-9edb-796185e648a2) may not exist in the user_profiles table.

### 4. **Data Type Mismatches**
The update payload may contain data types that don't match the expected schema.

## Solution Implementation

### Step 1: Run the Diagnostic and Fix Script

Execute the SQL script `xhr_patch_400_error_fix.sql` in your Supabase SQL Editor:

```bash
# Copy and paste the contents of xhr_patch_400_error_fix.sql
# Then run it in Supabase SQL Editor
```

### Step 2: What the Fix Does

The script performs these actions:

1. **Diagnoses Current State**
   - Checks if user_profiles table exists
   - Verifies the target user profile exists
   - Lists all current columns and RLS policies
   - Counts existing records and policies

2. **Adds Missing Columns**
   - `name` - Referenced in UserOnboarding.tsx updates
   - `full_name` - Alias for display name
   - `profile_completed` - Boolean flag for profile completion
   - `onboarding_completed` - Boolean flag for onboarding status
   - `onboarding_completed_at` - Timestamp for completion
   - `notification_preferences` - JSONB for user preferences

3. **Fixes RLS Policies**
   - Drops circular/problematic policies
   - Creates safe, non-recursive policies
   - Allows users to update their own profiles
   - Provides service role full access

4. **Creates Target User Profile**
   - Creates the specific user profile if missing
   - Sets basic required fields
   - Ensures the profile is ready for updates

5. **Tests PATCH Operation**
   - Simulates the exact PATCH operation
   - Verifies the update works correctly
   - Provides detailed error handling

### Step 3: Test the Fix

After running the script, test the PATCH request:

**Request:**
```
PATCH https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/user_profiles?user_id=eq.a16c2293-fbb0-48ac-9edb-796185e648a2

Content-Type: application/json
Authorization: Bearer [your_token]

{
  "name": "Updated Test User",
  "full_name": "Updated Test User", 
  "department": "Test Department",
  "position": "Test Position",
  "bio": "Updated bio",
  "phone": "+250123456789",
  "location": "Test Location",
  "timezone": "UTC",
  "language_preference": "en",
  "profile_completed": true,
  "onboarding_completed": true,
  "notification_preferences": {
    "email_notifications": true,
    "push_notifications": false
  }
}
```

**Expected Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "uuid",
  "user_id": "a16c2293-fbb0-48ac-9edb-796185e648a2",
  "name": "Updated Test User",
  "full_name": "Updated Test User",
  "department": "Test Department",
  "position": "Test Position",
  "bio": "Updated bio",
  "phone": "+250123456789",
  "location": "Test Location",
  "timezone": "UTC",
  "language_preference": "en",
  "profile_completed": true,
  "onboarding_completed": true,
  "notification_preferences": {
    "email_notifications": true,
    "push_notifications": false
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

## Prevention Measures

### 1. Frontend Validation
Ensure the frontend code validates that required fields exist before making PATCH requests.

### 2. Database Schema Synchronization
Keep frontend TypeScript interfaces in sync with actual database schema.

### 3. RLS Policy Testing
Regularly test RLS policies with different user scenarios.

### 4. Error Handling
Improve frontend error handling to show specific 400 error details.

## Alternative Solutions

If the main fix doesn't work, try these alternatives:

### Alternative 1: Minimal Schema Fix
Run only the column additions:
```sql
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
```

### Alternative 2: Complete RLS Reset
Temporarily disable RLS to test:
```sql
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
-- Test PATCH request
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

### Alternative 3: Manual Profile Creation
Create the user profile manually:
```sql
INSERT INTO public.user_profiles (
    user_id, username, display_name, status, is_online
) VALUES (
    'a16c2293-fbb0-48ac-9edb-796185e648a2'::uuid,
    'testuser',
    'Test User',
    'active',
    false
) ON CONFLICT (user_id) DO NOTHING;
```

## Verification Commands

After applying the fix, run these verification commands:

```sql
-- Check user profile exists
SELECT * FROM public.user_profiles 
WHERE user_id::text = 'a16c2293-fbb0-48ac-9edb-796185e648a2';

-- Check columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('name', 'full_name', 'profile_completed', 'onboarding_completed');

-- Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

## Expected Outcome

After applying this fix:

1. ✅ XHR PATCH requests to user_profiles will return 200 OK
2. ✅ User onboarding workflow will complete successfully  
3. ✅ Profile updates will work for all users
4. ✅ RLS policies will be secure and functional
5. ✅ Database schema will match frontend expectations

The 400 error should be resolved and the PATCH operation will succeed.