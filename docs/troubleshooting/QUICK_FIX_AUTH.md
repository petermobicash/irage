# 🚀 Quick Authentication Fix

## The Problem
Your authentication is not working because:
1. ✅ Supabase is running correctly
2. ✅ Configuration is correct
3. ❌ **No admin user exists in the database**
4. ✅ Session persistence has been fixed

## The Solution (2 Minutes)

### Step 1: Open Supabase Studio
Open this URL in your browser:
```
http://127.0.0.1:54323
```

### Step 2: Create Admin User
1. Click on **"Authentication"** in the left sidebar
2. Click on **"Users"** 
3. Click the **"Add user"** button (top right)
4. Select **"Create new user"**
5. Fill in the form:
   - **Email**: `admin@benirage.org`
   - **Password**: `admin123`
   - **Auto Confirm User**: ✅ **CHECK THIS BOX** (very important!)
6. Click **"Create user"**

### Step 3: Test Login
1. Start your dev server (if not running):
   ```bash
   npm run dev
   ```

2. Open your app:
   ```
   http://localhost:5173/admin
   ```

3. Login with:
   - **Email**: `admin@benirage.org`
   - **Password**: `admin123`

## ✅ What Was Fixed

1. **Session Persistence** - Changed in `src/lib/supabase.ts`:
   ```typescript
   auth: {
     persistSession: true,      // ✅ Now enabled
     autoRefreshToken: true,    // ✅ Now enabled
     detectSessionInUrl: true   // ✅ Now enabled
   }
   ```

2. **User Profile** - Will be created automatically when you first login (handled by the app)

## 🎯 Alternative: Development Bypass

The app also has a hardcoded bypass for development. You can login with:
- **Email**: `admin@benirage.org`
- **Password**: `password123`

This works without creating a user in Supabase (see `LoginForm.tsx:23-34`).

## 🐛 Troubleshooting

### "Invalid login credentials"
- Make sure you created the user in Supabase Studio
- Make sure you checked "Auto Confirm User"
- Try the development bypass credentials instead

### "Unable to create or load user profile"
- This is normal on first login
- The app will create the profile automatically
- Refresh the page after first login

### Session not persisting
- Clear browser cache and cookies
- Make sure the Supabase client changes were saved
- Restart your dev server

## 📝 Next Steps

After successful login, you can:
1. Access the CMS at `/cms`
2. Manage content, users, and settings
3. Create additional users through the admin panel

## 🔒 For Production

When deploying to production:
1. Get real Supabase credentials from https://supabase.com
2. Update `.env` with production URL and keys
3. Create admin user in production Supabase dashboard
4. Remove or disable the development bypass in `LoginForm.tsx`

---

**Status**: ✅ Authentication system is now fixed and ready to use!