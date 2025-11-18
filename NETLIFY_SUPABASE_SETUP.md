# Netlify + Supabase Configuration Guide

This guide will help you connect your Netlify deployment to your Supabase database.

## Prerequisites

- Netlify account with your site deployed
- Supabase project: **Benirage-web** (Project ID: `sshguczouozvsdwzfcbx`)

## Step 1: Access Netlify Environment Variables

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site (Benirage project)
3. Navigate to **Site settings** → **Environment variables**
4. Click **Add a variable** or **Add environment variables**

## Step 2: Add Supabase Environment Variables

Add the following three environment variables:

### Variable 1: VITE_SUPABASE_URL
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://sshguczouozvsdwzfcbx.supabase.co`
- **Scopes**: Select all scopes (Production, Deploy Previews, Branch deploys)

### Variable 2: VITE_SUPABASE_ANON_KEY
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Nzk2ODEsImV4cCI6MjA3OTA1NTY4MX0.ooh5NGBqv6U0MLcwvURzcf-DVx_qvpYobdjy-ukpKbw`
- **Scopes**: Select all scopes (Production, Deploy Previews, Branch deploys)

### Variable 3: SUPABASE_SERVICE_ROLE_KEY (Optional - for admin operations)
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzaGd1Y3pvdW96dnNkd3pmY2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ3OTY4MSwiZXhwIjoyMDc5MDU1NjgxfQ.g_DHPAaaTvVmEIKoLvvN-CXhYWNcA7oQ76n34udwwRs`
- **Scopes**: Production only (for security)
- **Note**: This key has elevated privileges. Only use in production and keep it secure.

## Step 3: Trigger a New Deploy

After adding the environment variables:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete

Alternatively, push a new commit to your repository to trigger an automatic deploy.

## Step 4: Verify the Connection

Once deployed, test your application:

1. Visit your Netlify site URL
2. Try to:
   - View content (should load from Supabase)
   - Create a comment or interact with the database
   - Check browser console for any connection errors

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors
- **Solution**: Verify the Supabase URL is correct
- Check that your Netlify domain is added to Supabase's allowed origins:
  1. Go to Supabase Dashboard → Settings → API
  2. Add your Netlify URL to "Site URL" and "Redirect URLs"

### Issue: Authentication not working
- **Solution**: Verify the ANON key is correct and hasn't expired
- Check Supabase Dashboard → Settings → API to confirm the key

### Issue: Admin features not working
- **Solution**: Ensure SUPABASE_SERVICE_ROLE_KEY is set correctly
- This key should only be used server-side, never exposed to the client

## Security Best Practices

1. **Never commit** `.env` file to git (it's in `.gitignore`)
2. **Service Role Key**: Only use in secure server environments
3. **Anon Key**: Safe to use in client-side code (has RLS protection)
4. **Rotate keys**: If compromised, regenerate in Supabase Dashboard

## Additional Configuration

### Custom Domain Setup
If using a custom domain (e.g., benirage.org):
1. Add it in Netlify: **Domain settings** → **Add custom domain**
2. Update Supabase: Add the domain to allowed origins in Supabase Dashboard

### Environment-Specific Variables
For different environments (staging, preview):
- Use Netlify's scope feature to set different values per environment
- Consider creating separate Supabase projects for staging/development

## Quick Reference

| Variable | Purpose | Exposure |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Client-safe |
| `VITE_SUPABASE_ANON_KEY` | Public API key with RLS | Client-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | Server-only |

## Support

- Netlify Docs: https://docs.netlify.com/environment-variables/overview/
- Supabase Docs: https://supabase.com/docs/guides/getting-started
- Project Dashboard: https://sshguczouozvsdwzfcbx.supabase.co

---

**Last Updated**: 2025-01-18
**Project**: Benirage-web
**Supabase Project ID**: sshguczouozvsdwzfcbx