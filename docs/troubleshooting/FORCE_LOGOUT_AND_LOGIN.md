# 🔄 Force Logout and Clear Session

## The Issue
You're seeing "You don't have permission to manage users" because your browser has **cached the old session data** from before we updated your permissions.

## ✅ Solution: Complete Session Reset

### Step 1: Clear Browser Storage (CRITICAL!)

#### Option A: Using Browser DevTools (Recommended)
1. Press **F12** to open DevTools
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. In the left sidebar, expand **Local Storage**
4. Click on `http://localhost:5173` (or your dev server URL)
5. **Right-click** → **Clear**
6. Expand **Session Storage** and do the same
7. Go to **Cookies** and delete all cookies for localhost
8. Close DevTools

#### Option B: Using Browser Settings
1. Press **Ctrl+Shift+Delete** (Windows/Linux) or **Cmd+Shift+Delete** (Mac)
2. Select **"Cookies and other site data"** and **"Cached images and files"**
3. Time range: **"All time"** or **"Last hour"**
4. Click **"Clear data"**

### Step 2: Hard Refresh the Page
1. Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
2. Or press **Ctrl+F5**

### Step 3: Login Again
1. Go to: `http://localhost:5173/admin` or `/cms`
2. Login with:
   - **Email**: `admin@benirage.org`
   - **Password**: `admin123`

### Step 4: Verify Permissions
After logging in, open browser console (F12) and run:
```javascript
// Check if you're logged in
supabase.auth.getUser().then(({data}) => console.log('User:', data.user?.email));

// Check your profile
fetch('http://127.0.0.1:54321/rest/v1/users?user_id=eq.' + 
  (await supabase.auth.getUser()).data.user.id, {
  headers: {
    'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    'Authorization': 'Bearer ' + (await supabase.auth.getSession()).data.session.access_token
  }
}).then(r => r.json()).then(console.log);
```

You should see:
```json
{
  "role": "super_admin",
  "is_super_admin": true,
  "is_active": true
}
```

## 🚨 If Still Not Working

### Nuclear Option: Complete Reset

```bash
# 1. Stop the dev server (Ctrl+C)

# 2. Clear all Supabase data
rm -rf ~/.supabase

# 3. Restart Supabase
cd /home/peter/Desktop/beniweb/beniragewebpro-benirage2025070917
supabase stop
supabase start

# 4. Re-run the permission fix
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f fix-admin-permissions.sql

# 5. Start dev server
npm run dev

# 6. Clear browser cache completely
# 7. Login again
```

## 🔍 Debug: Check What's Happening

Add this to your browser console after login to see what permissions you have:

```javascript
// Get current user
const { data: { user } } = await supabase.auth.getUser();
console.log('Current User ID:', user?.id);
console.log('Current User Email:', user?.email);

// Get user profile from database
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('user_id', user?.id)
  .single();
  
console.log('User Profile:', profile);
console.log('Role:', profile?.role);
console.log('Is Super Admin:', profile?.is_super_admin);
console.log('Custom Permissions:', profile?.custom_permissions);
```

## ✨ What Should Happen

After clearing cache and logging in again:
- ✅ You should see the CMS dashboard
- ✅ All menu items should be accessible
- ✅ No "Access Restricted" messages
- ✅ Full admin capabilities

## 📝 Why This Happens

The Supabase client caches session data in browser storage. When we updated your permissions in the database, your browser still had the old session with the old role (`author` instead of `super_admin`).

**Session persistence** (which we enabled) is good for keeping users logged in, but it means you need to clear the cache when permissions change.

---

**TL;DR**: Clear browser cache → Hard refresh → Login again → Everything works! 🎉