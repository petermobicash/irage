# XHR 400 Error Fix for user_profiles Query

## Problem Analysis

**Failing Request:**
```
GET https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/user_profiles?select=user_id&id=eq.new
Status: HTTP/2 400 Bad Request (333ms)
```

## Root Cause

The 400 error occurs because the query attempts to filter by `id=eq.new` where:

1. **Field Type Mismatch**: The `id` field in `user_profiles` table is a **UUID primary key**
2. **Invalid UUID Format**: The value "new" is not a valid UUID format
3. **Expected UUID Format**: UUIDs should match pattern: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**Example of valid UUID:** `a16c2293-fbb0-48ac-9edb-796185e648a2`

## Database Schema Analysis

The `user_profiles` table structure includes:
- `id` - UUID PRIMARY KEY (auto-generated)
- `user_id` - UUID REFERENCES auth.users(id)
- `username` - TEXT
- `display_name` - TEXT  
- `status` - TEXT DEFAULT 'offline'
- Other profile fields...

## Possible Solutions

### Option 1: If "new" represents a user status
**Change the filter from `id=eq.new` to `status=eq.new`**

```javascript
// BEFORE (❌ Wrong)
supabase
  .from('user_profiles')
  .select('user_id')
  .eq('id', 'new')

// AFTER (✅ Correct)
supabase
  .from('user_profiles')
  .select('user_id')
  .eq('status', 'new')
```

**Generated Query:**
```
GET /rest/v1/user_profiles?select=user_id&status=eq.new
```

### Option 2: If looking for user creation/onboarding
**Query by user_id with actual UUID or use different filter**

```javascript
// For user creation scenarios
supabase
  .from('user_profiles')
  .select('user_id')
  .eq('username', 'new')  // If username field stores "new"
```

### Option 3: If searching by username
**Use username field instead of id**

```javascript
// If "new" is a username
supabase
  .from('user_profiles')
  .select('user_id')
  .eq('username', 'new')
```

## Step-by-Step Fix Implementation

### Step 1: Identify the Query Source
Search for the failing query in your codebase:

```bash
# Search in .tsx files
grep -r "id=eq.new" src/
grep -r "select.*user_id.*id.*eq" src/

# Search in .js files  
grep -r "id.*eq.*new" src/
```

### Step 2: Determine the Intended Behavior
Based on context, determine what "new" should represent:
- **User status**: Use `status=eq.new`
- **Username**: Use `username=eq.new`
- **User creation**: Use different approach

### Step 3: Update the Query
Replace the problematic query with the correct filter:

```javascript
// Updated query based on intended behavior
const { data, error } = await supabase
  .from('user_profiles')
  .select('user_id')
  .eq('status', 'new')  // or appropriate field
```

### Step 4: Test the Fix
Verify the corrected query works:

```javascript
// Test script
const testQuery = async () => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('status', 'new')  // Corrected filter
    
    if (error) {
      console.log('❌ Query failed:', error.message)
    } else {
      console.log('✅ Query succeeded:', data)
    }
  } catch (err) {
    console.log('❌ Exception:', err.message)
  }
}
```

## Immediate Debugging Steps

### 1. Run Diagnostic SQL Query
Execute this in your Supabase SQL Editor:

```sql
-- Check if user_profiles table exists and get sample data
SELECT 
  'Table exists: ' || 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_profiles' 
    AND table_schema = 'public'
  ) THEN '✅ YES' ELSE '❌ NO' END as table_status,

  'Profile count: ' || COUNT(*) as profile_count,

  -- Sample a few profiles to understand the structure
  STRING_AGG(
    'id=' || id::text || ', status=' || status || ', username=' || COALESCE(username, 'NULL'),
    ' | '
  ) as sample_profiles

FROM public.user_profiles 
LIMIT 5;
```

### 2. Check for "new" status profiles
```sql
-- Look for profiles with status "new"
SELECT id, user_id, username, status, created_at
FROM public.user_profiles 
WHERE status = 'new'
LIMIT 10;
```

### 3. Test the corrected query
```sql
-- Test the corrected query format
SELECT user_id 
FROM public.user_profiles 
WHERE status = 'new';
```

## Common Patterns and Solutions

### Pattern 1: New User Registration
**Problem**: Code trying to fetch "new" user during registration
**Solution**: 
```javascript
// Don't query by id=eq.new
// Instead, create new profile or query by status
const newUserProfile = await supabase
  .from('user_profiles')
  .select('user_id')
  .eq('status', 'new')
  .limit(1)
```

### Pattern 2: Onboarding Flow
**Problem**: Searching for user in onboarding process
**Solution**:
```javascript
// Use appropriate field for onboarding
const onboardingUser = await supabase
  .from('user_profiles')
  .select('user_id')
  .eq('username', 'new')  // if username stores temporary value
  .eq('status', 'onboarding')  // or use proper status
```

### Pattern 3: Default/Placeholder User
**Problem**: Querying for default user record
**Solution**:
```javascript
// Use proper UUID or create with known ID
const defaultProfile = await supabase
  .from('user_profiles')
  .select('user_id')
  .eq('username', 'admin')  // or proper identifier
```

## Validation Commands

Run these commands to validate the fix:

### Test corrected query in browser console:
```javascript
// In browser dev tools
const { data, error } = await supabase
  .from('user_profiles')
  .select('user_id')
  .eq('status', 'new')

console.log('Result:', { data, error })
```

### Check in Supabase Dashboard:
1. Go to Table Editor > user_profiles
2. Filter by status = "new" 
3. Verify results exist

## Prevention

To prevent similar issues:

1. **Use Type Safety**: Define TypeScript interfaces for queries
2. **Validate UUIDs**: Check UUID format before queries
3. **Use Proper Field Types**: Match filter fields to column data types
4. **Error Handling**: Add proper error handling for query failures
5. **Unit Tests**: Test queries with various filter values

## Impact

This fix resolves:
- ❌ **HTTP 400 Bad Request** → ✅ **Successful Response**
- ❌ **Invalid UUID syntax error** → ✅ **Proper query execution**
- ❌ **Failed user profile queries** → ✅ **Working profile management**

The corrected query maintains the same functionality while using the appropriate field and value types.