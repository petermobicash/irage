# Push Migrations to Supabase - Complete Guide

## Connection Issues Encountered
We're experiencing network connectivity issues with the Supabase CLI. Here are alternative methods to push your migrations.

## Method 1: Using Supabase Dashboard (RECOMMENDED - Most Reliable)

### Steps:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qlnpzqorijdcbcgajuei
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `combined_migrations.sql` (created in your project root)
5. Click **Run** to execute all migrations

**Note:** The `combined_migrations.sql` file contains all your migrations in order.

---

## Method 2: Using psql with Direct Connection

If you have `psql` installed and want to try direct connection:

```bash
# Get your connection string from Supabase Dashboard:
# Settings > Database > Connection String > Direct Connection

# Then run:
PGPASSWORD='3UxVTWg2igQVNSgg' psql -h db.qlnpzqorijdcbcgajuei.supabase.co -U postgres -d postgres -f combined_migrations.sql
```

---

## Method 3: Using Supabase CLI with Better Network

If the CLI connection issues are network-related, try:

1. **Check your internet connection** - ensure you have stable connectivity
2. **Try from a different network** - sometimes corporate/public WiFi blocks database ports
3. **Use a VPN** if your ISP blocks certain ports

Then retry:
```bash
supabase link --project-ref qlnpzqorijdcbcgajuei --password '3UxVTWg2igQVNSgg'
supabase db push
```

---

## Method 4: Manual Migration via Node.js Script

I can create a Node.js script that uses your Supabase service role key to push migrations:

```bash
node scripts/push-migrations-manual.js
```

---

## Method 5: Individual Migration Files

If you prefer to run migrations one by one in the Supabase Dashboard:

### Order of migrations (run in this sequence):
1. `000_initial_schema.sql`
2. `001_create_chat_schema.sql`
3. `002_add_missing_tables_and_columns.sql`
4. `005_add_cms_tables.sql`
5. ... (continue with remaining files in numerical order)

---

## Troubleshooting

### Error: "Tenant or user not found"
- Verify your project ref: `qlnpzqorijdcbcgajuei`
- Verify your database password: `3UxVTWg2igQVNSgg`
- Check if your Supabase project is active in the dashboard

### Error: "Network unreachable" or "Connection timeout"
- Your network may be blocking database ports (5432, 6543)
- Try using a different network or VPN
- Use Method 1 (Dashboard) which uses HTTPS

### Error: "Migration already exists"
- Some migrations may already be applied
- Check the `supabase_migrations.schema_migrations` table in your database
- Skip already-applied migrations

---

## Recommended Approach

**For immediate results, use Method 1 (Supabase Dashboard):**

1. Open: https://supabase.com/dashboard/project/qlnpzqorijdcbcgajuei/sql
2. Create a new query
3. Copy contents from `combined_migrations.sql`
4. Run the query
5. Check for any errors and address them individually

---

## Files Created

- `combined_migrations.sql` - All migrations combined in order
- This guide - `PUSH_MIGRATIONS_TO_SUPABASE.md`

---

## Need Help?

If you encounter specific errors when running migrations, share the error message and I can help debug the specific migration causing issues.