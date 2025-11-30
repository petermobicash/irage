# XHR 400 Error - "new" Variable Fix

## Problem Analysis

The HTTP 400 error is caused by a query string that contains `id=eq.new` where "new" is being treated as a literal string instead of a variable.

**Failing Query:**
```
https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/user_profiles?select=user_id&id=eq.new
```

**Root Cause:**
- A frontend variable is not being properly interpolated
- The query should be `id=eq.{userIdVariable}` instead of `id=eq.new`
- "new" is a reserved keyword and not a valid UUID

## Frontend Code Fix

### 1. Identify the Source File

Search for files making user_profiles queries with "new" variable:

```bash
# Search for user_profiles queries
grep -r "user_profiles.*select.*user_id" src/
grep -r "eq\.new" src/
grep -r "id.*eq.*new" src/
```

### 2. Common Fix Patterns

#### Pattern A: URL Template Literal Issue
**Before (❌ Wrong):**
```typescript
const userId = 'new'; // This creates the literal string "new"
const query = `user_profiles?select=user_id&id=eq.${userId}`;
```

**After (✅ Fixed):**
```typescript
const userId = getCurrentUserId(); // Get actual user ID
if (!userId || userId === 'new') {
  console.error('Invalid user ID');
  return;
}
const query = `user_profiles?select=user_id&id=eq.${userId}`;
```

#### Pattern B: Template String Variable Interpolation
**Before (❌ Wrong):**
```typescript
const userId = "new"; // Variable set to literal "new"
const { data, error } = await supabase
  .from('user_profiles')
  .select('user_id')
  .eq('id', userId); // This creates id=eq.new
```

**After (✅ Fixed):**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error('User not authenticated');
}
const { data, error } = await supabase
  .from('user_profiles')
  .select('user_id')
  .eq('user_id', user.id); // Use proper field and user ID
```

#### Pattern C: Dynamic Query Building
**Before (❌ Wrong):**
```typescript
const buildUserQuery = (userId) => {
  return `user_profiles?select=user_id&id=eq.${userId}`;
};
// If called with buildUserQuery('new'), it fails
```

**After (✅ Fixed):**
```typescript
const buildUserQuery = (userId) => {
  if (!userId || userId === 'new' || userId.length < 10) {
    throw new Error('Invalid user ID format');
  }
  return `user_profiles?select=user_id&id=eq.${userId}`;
};
```

### 3. Specific Component Fixes

#### Fix in User Management Components
In files like `src/components/cms/UserManager.tsx`:

**Before (❌ Wrong):**
```typescript
const handleEdit = (userId) => {
  const query = `user_profiles?select=user_id&id=eq.${userId}`;
  // If userId is "new", this fails
};
```

**After (✅ Fixed):**
```typescript
const handleEdit = (userId) => {
  if (userId === 'new') {
    // Handle new user creation
    setFormData({ /* reset form for new user */ });
    return;
  }
  
  // Handle existing user editing
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
};
```

#### Fix in Authentication Flow
In auth-related components:

**Before (❌ Wrong):**
```typescript
const getUserProfile = async (userId) => {
  return supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId) // Wrong field and possible "new" value
    .single();
};
```

**After (✅ Fixed):**
```typescript
const getUserProfile = async (userId) => {
  if (!userId || userId === 'new') {
    throw new Error('Invalid user ID provided');
  }
  
  return supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId) // Correct field
    .single();
};
```

### 4. Debugging Steps

1. **Find the exact source:**
   ```bash
   # Search for patterns that might cause this
   grep -r "eq\.new" src/ --include="*.ts" --include="*.tsx"
   grep -r "user_profiles.*new" src/ --include="*.ts" --include="*.tsx"
   ```

2. **Check variable assignments:**
   ```bash
   # Look for variables being set to "new"
   grep -r "=.*[\"']new[\"']" src/ --include="*.ts" --include="*.tsx"
   ```

3. **Check URL construction:**
   ```bash
   # Look for template literals building queries
   grep -r "[\$\{].*user_profiles" src/ --include="*.ts" --include="*.tsx"
   ```

### 5. Quick Validation Script

Create this script to test the fix:

```typescript
// validate-user-profile-query.ts
import { supabase } from './src/lib/supabase';

export const testUserProfileQuery = async () => {
  try {
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ No authenticated user');
      return;
    }
    
    console.log('✅ Authenticated user found:', user.id);
    
    // Test the query that was failing
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.log('❌ Query failed:', error.message);
    } else {
      console.log('✅ Query successful:', data);
    }
  } catch (err) {
    console.log('❌ Test failed:', err);
  }
};
```

### 6. Prevention Guidelines

1. **Always validate user IDs before queries:**
   ```typescript
   const isValidUserId = (id: string) => {
     return id && 
            id !== 'new' && 
            id.length > 10 && 
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
   };
   ```

2. **Use TypeScript types for user IDs:**
   ```typescript
   type UserId = string & { readonly brand: unique symbol };
   
   const createUserId = (id: string): UserId => {
     if (!isValidUserId(id)) {
       throw new Error('Invalid user ID format');
     }
     return id as UserId;
   };
   ```

3. **Centralize query building:**
   ```typescript
   // utils/queryBuilders.ts
   export const buildUserProfileQuery = (userId: string) => {
     if (!isValidUserId(userId)) {
       throw new Error('Invalid user ID for profile query');
     }
     
     return supabase
       .from('user_profiles')
       .select('*')
       .eq('user_id', userId);
   };
   ```

## Implementation Steps

1. **Search and identify** all instances of the problematic pattern
2. **Fix variable assignments** to use proper user IDs instead of "new"
3. **Update query building** to validate user IDs before use
4. **Test the fixes** with the validation script
5. **Deploy and monitor** for the HTTP 400 errors

## Expected Result

After applying these fixes:
- ❌ `GET /rest/v1/user_profiles?select=user_id&id=eq.new` → ✅ Resolved
- ✅ `GET /rest/v1/user_profiles?select=user_id&id=eq.[ACTUAL_UUID]` → Working
- ✅ No more HTTP 400 errors in browser console
- ✅ User profile queries work correctly

The fix ensures that all user profile queries use valid UUIDs instead of the literal string "new".