# Push Seed Data to Supabase - Complete Guide

## Issue Found
The seed data insertion was failing due to a type mismatch in the `update_chat_room_last_activity()` trigger function. This has been fixed in migration `1000_fix_chat_room_trigger.sql`.

## Step-by-Step Instructions

### Step 1: Push the Fix Migration First

You need to push the trigger fix migration before inserting seed data. Use **ONE** of these methods:

#### Method A: Via Supabase Dashboard (Recommended - Easiest)
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/sshguczouozvsdwzfcbx/editor)
2. Click "New Query"
3. Copy the contents of `supabase/migrations/1000_fix_chat_room_trigger.sql`
4. Paste into the SQL Editor
5. Click "Run" or press Ctrl+Enter
6. Wait for success message

#### Method B: Via Supabase CLI with Password
```bash
npx supabase db push --linked -p [YOUR-DATABASE-PASSWORD]
```

#### Method C: Via psql Command Line
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres" -f supabase/migrations/1000_fix_chat_room_trigger.sql
```

### Step 2: Push the Seed Data

After the migration is successfully applied, push the seed data using **ONE** of these methods:

#### Method A: Via Supabase Dashboard (Recommended - Easiest)
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/sshguczouozvsdwzfcbx/editor)
2. Click "New Query"
3. Copy the entire contents of `supabase/seed.sql`
4. Paste into the SQL Editor
5. Click "Run" or press Ctrl+Enter
6. Wait for success message

#### Method B: Via psql Command Line
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres" -f supabase/seed.sql
```

#### Method C: Via Supabase CLI with Seed Flag
```bash
npx supabase db push --linked --include-seed -p [YOUR-DATABASE-PASSWORD]
```

## What the Seed Data Contains

The seed file will populate your database with:

✅ **Sample Content Pages** (3 items)
- Welcome to BENIRAGE Community
- Philosophy and Ethics Discussion
- Community Guidelines

✅ **Sample Chat Messages** (3 items)
- Welcome message from Community Manager
- Introduction from New Member
- Response from Regular Contributor

✅ **Contact Form Submissions** (3 items)
- Partnership inquiry
- Volunteer opportunity request
- Event collaboration request

✅ **Membership Applications** (2 items)
- Community Development Officer application
- Teacher application

✅ **Volunteer Applications** (2 items)
- University student application (pending)
- Cultural Heritage Officer application (approved)

✅ **Partnership Applications** (2 items)
- Rwanda Youth Development Initiative
- Kigali Cultural Center

✅ **Donation Records** (3 items)
- One-time donations
- Monthly recurring donation
- Pending donation

✅ **Group Permission Assignments**
- Assigns permissions to all predefined groups
- Super Administrators get full access
- Administrators get most permissions
- Content Managers get content workflow permissions
- Content Initiators get basic creation permissions
- Content Reviewers get review-only permissions

## Important Notes

1. **Safe to Run Multiple Times**: The seed file uses `ON CONFLICT DO NOTHING` clauses, so it's safe to run multiple times without creating duplicates.

2. **User Profiles Commented Out**: Sample user profiles are commented out because they require valid `user_id` values from `auth.users`. To add sample profiles, first create users via Supabase Auth, then insert profiles with their UUIDs.

3. **No Data Loss**: This seed data only adds new records; it doesn't modify or delete existing data.

4. **Verification**: After running the seed, you can verify by checking:
   - Content table: Should have 3 new pages
   - Chat messages: Should have 3 new messages
   - Various application tables: Should have sample submissions

## Troubleshooting

### If you get "password authentication failed"
- Make sure you're using the correct database password
- You can reset it from: https://supabase.com/dashboard/project/sshguczouozvsdwzfcbx/settings/database

### If you get "relation does not exist"
- Make sure all migrations are applied first
- Run: `npx supabase db push --linked -p [YOUR-PASSWORD]`

### If you get type mismatch errors
- Make sure migration 1000_fix_chat_room_trigger.sql was applied successfully
- Check the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_chat_room_activity';`

## Quick Command Reference

```bash
# Push all pending migrations
npx supabase db push --linked -p [YOUR-PASSWORD]

# Push migrations and seed data together
npx supabase db push --linked --include-seed -p [YOUR-PASSWORD]

# Check migration status
npx supabase migration list

# View database connection info
npx supabase status
```

## Success Indicators

After successful seed data insertion, you should see output similar to:

```
========================================
COMPLETE SAMPLE DATA SEEDED SUCCESSFULLY
========================================
✅ Created sample content for commenting
✅ Added sample chat messages
✅ Created sample user profiles
✅ Added 3 contact submissions
✅ Added 2 membership applications
✅ Added 2 volunteer applications
✅ Added 2 partnership applications
✅ Added 3 donations
✅ Added X group permission assignments

The application now has comprehensive sample data for:
- Content pages with commenting enabled
- Chat messages for testing
- User profiles for presence features
- Contact form submissions
- Membership applications
- Volunteer applications
- Partnership applications
- Donation records
- Group permission assignments

You can now test all features with realistic data!
========================================