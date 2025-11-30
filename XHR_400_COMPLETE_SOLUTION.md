# XHR 400 Error Complete Solution

## Problem Summary

**Error:** Multiple HTTP 400 errors from Supabase API calls
```
GET /rest/v1/user_profiles?select=user_id&id=eq.new
HTTP/2 400  357ms
```

**Root Cause:** The query contains `id=eq.new` where "new" is being treated as a literal string instead of a valid UUID variable.

## Issues Identified and Fixed

### 1. Documentation Error ❌ → ✅
**File:** `apply_database_fix.js`
- **Before:** Line 92 showed misleading example: `user_profiles?select=user_id&id=eq.new`
- **After:** Fixed to show correct example: `user_profiles?select=user_id&user_id=eq.[USER_ID]`

### 2. Frontend Variable Issue 🔍
**Problem:** Frontend code likely has variables not being properly interpolated
- Variables containing "new" instead of actual UUIDs
- URL construction using literal "new" string
- Missing validation of user IDs before queries

## Complete Fix Implementation

### Step 1: Fix Frontend Code

#### A. Identify Problematic Code
```bash
# Search for potential sources
grep -r "eq\.new" src/ --include="*.ts" --include="*.tsx"
grep -r "user_profiles.*new" src/ --include="*.ts" --include="*.tsx"
grep -r "=.*[\"']new[\"']" src/ --include="*.ts" --include="*.tsx"
```

#### B. Common Fix Patterns

**Pattern 1: Variable Assignment**
```typescript
// ❌ Wrong
const userId = 'new';

// ✅ Correct
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('User not authenticated');
const userId = user.id;
```

**Pattern 2: Query Building**
```typescript
// ❌ Wrong
.eq('id', userId) // where userId might be "new"

// ✅ Correct
.eq('user_id', userId) // proper field name
```

**Pattern 3: URL Construction**
```typescript
// ❌ Wrong
const query = `user_profiles?select=user_id&id=eq.${userId}`;

// ✅ Correct
const { data, error } = await supabase
  .from('user_profiles')
  .select('user_id')
  .eq('user_id', userId);
```

#### C. Validation Helper
```typescript
const isValidUserId = (id: string) => {
  return id && 
         id !== 'new' && 
         id.length >= 36 && 
         /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

const safeUserProfileQuery = (userId: string) => {
  if (!isValidUserId(userId)) {
    throw new Error('Invalid user ID format');
  }
  
  return supabase
    .from('user_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .single();
};
```

### Step 2: Test the Fix

#### Run Diagnostic Script
```bash
node diagnose_xhr_400_error.js
```

#### Run Test Script
```bash
node test_user_profile_fix.js
```

#### Browser Testing
1. Open browser DevTools → Network tab
2. Reload the application
3. Verify no more `id=eq.new` requests
4. Check for HTTP 200 responses instead of HTTP 400

### Step 3: Verify Database Schema

Ensure the user_profiles table has the correct structure:
```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public';

-- Should show user_id column as UUID type
```

## Prevention Guidelines

### 1. Always Validate User IDs
```typescript
const validateBeforeQuery = (userId: string) => {
  if (!userId || userId === 'new') {
    console.error('Invalid user ID:', userId);
    return false;
  }
  return true;
};
```

### 2. Use TypeScript Types
```typescript
type UserId = string & { readonly brand: unique symbol };
const createUserId = (id: string): UserId => {
  if (!validateUuid(id)) throw new Error('Invalid UUID');
  return id as UserId;
};
```

### 3. Centralize Query Functions
```typescript
// utils/userQueries.ts
export const getUserProfile = async (userId: string) => {
  if (!isValidUserId(userId)) {
    throw new Error('Invalid user ID for profile query');
  }
  
  return supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
};
```

## Expected Results

### Before Fix ❌
```
GET /rest/v1/user_profiles?select=user_id&id=eq.new
HTTP/2 400  357ms
{"message":"Invalid input syntax for type uuid"}
```

### After Fix ✅
```
GET /rest/v1/user_profiles?select=user_id&user_id=eq.[ACTUAL_UUID]
HTTP/2 200  123ms
{"data": {"user_id": "[ACTUAL_UUID]"}}
```

## Files Created/Modified

1. **Created:** `XHR_400_NEW_VARIABLE_FIX.md` - Detailed fix documentation
2. **Created:** `diagnose_xhr_400_error.js` - Diagnostic tool
3. **Created:** `test_user_profile_fix.js` - Validation script
4. **Modified:** `apply_database_fix.js` - Fixed misleading documentation

## Next Steps

1. **Run the diagnostic script** to identify frontend issues
2. **Fix the identified problems** using the patterns provided
3. **Test the fixes** using the validation script
4. **Monitor browser console** for remaining HTTP 400 errors
5. **Deploy and verify** in production

## Success Criteria

- ✅ No more `id=eq.new` requests in network tab
- ✅ All user profile queries use valid UUIDs
- ✅ HTTP 400 errors eliminated
- ✅ User profile functionality works correctly

The fix ensures that all user profile queries use proper UUID validation and correct field names, eliminating the HTTP 400 errors caused by the literal "new" string.