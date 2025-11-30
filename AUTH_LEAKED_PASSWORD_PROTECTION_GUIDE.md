# Auth Leaked Password Protection - Configuration Guide

## Overview
This guide covers enabling leaked password protection for Supabase Auth to enhance security.

## Issue Description
**Warning**: Leaked password protection is currently disabled. Supabase Auth can prevent the use of compromised passwords by checking against HaveIBeenPwned.org.

## Solution
Leaked password protection is configured at the Supabase project level, not in database migrations.

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings** → **Password Security**

### Step 2: Enable Leaked Password Protection
1. Look for the **"Leaked Password Protection"** section
2. Toggle the setting to **"Enabled"**
3. Save the changes

### Step 3: Configure Settings (if available)
- **Enable Pwned Password Check**: ON
- **Custom Message**: "This password appears in compromised databases. Please choose a different password."

### Step 4: Test Configuration
```bash
# Test with a known compromised password (example: "password123")
# Try to sign up or update password
# Should be rejected by the auth system
```

### Step 5: Verify in Code
```javascript
// Example: Check if password validation works
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123' // Should be rejected
})

if (error) {
  console.log('Password rejected:', error.message)
  // Expected: "Password has been compromised"
}
```

## Configuration Settings

### Environment Variables (if using API)
```bash
# No specific environment variables needed
# Configuration is handled via Supabase Dashboard
```

### Supabase CLI (Alternative)
```bash
# List current auth settings
supabase auth settings

# Note: CLI may not support leaked password config yet
# Use dashboard for configuration
```

## Verification Commands

### Check Current Settings via SQL
```sql
-- Check auth configuration (if accessible)
-- This may require elevated privileges
SELECT current_setting('app.auth.leaked_password_protection', true) as leaked_password_protection;
```

### Test User Registration
```javascript
// Test case 1: Known good password
const goodPassword = 'SecurePass123!@#';
await supabase.auth.signUp({
  email: 'user@example.com',
  password: goodPassword
});

// Test case 2: Compromised password (should fail)
const compromisedPassword = 'password123';
await supabase.auth.signUp({
  email: 'user2@example.com', 
  password: compromisedPassword
});
// Expected: Auth error about compromised password
```

## Benefits
- **Security**: Prevents users from using known compromised passwords
- **Compliance**: Meets security best practices
- **User Education**: Alerts users about password security
- **Data Protection**: Reduces risk of account compromise

## Troubleshooting

### If Leaked Password Protection is Not Available
1. **Update Supabase CLI**: `supabase update`
2. **Check Supabase Version**: Ensure you're on a recent version
3. **Contact Support**: Feature may be rolling out gradually

### If Passwords Are Not Being Checked
1. **Clear Browser Cache**: Restart authentication flow
2. **Check Network**: Ensure HaveIBeenPwned API is accessible
3. **Verify Configuration**: Double-check dashboard settings

### Common Error Messages
- "Password has been compromised"
- "This password is not secure"
- "Please choose a different password"

## Implementation Checklist
- [ ] Access Supabase Dashboard
- [ ] Navigate to Auth → Settings → Password Security
- [ ] Enable "Leaked Password Protection"
- [ ] Configure custom message (optional)
- [ ] Save settings
- [ ] Test with known compromised password
- [ ] Verify user registration flow
- [ ] Update security documentation

## Related Documentation
- [Supabase Auth Security Guide](https://supabase.com/docs/guides/auth/auth-password)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3#PwnedPasswords)
- [Password Security Best Practices](https://supabase.com/docs/guides/auth/auth-password#password-strength-and-leaked-password-protection)

## Support
If you encounter issues:
1. Check Supabase dashboard for the latest UI
2. Review Supabase documentation for updates
3. Contact Supabase support for configuration assistance

---

**Priority**: HIGH (Security Enhancement)  
**Configuration Method**: Supabase Dashboard  
**Implementation Time**: 5 minutes  
**Downtime**: None