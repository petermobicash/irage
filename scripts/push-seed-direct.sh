#!/bin/bash

# Push Seed Data to Supabase
# This script pushes the migration fix and seed data to your Supabase database

set -e

echo "========================================="
echo "PUSH SEED DATA TO SUPABASE"
echo "========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with your Supabase credentials"
    exit 1
fi

# Load environment variables
source .env

# Check if required variables are set
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ Error: VITE_SUPABASE_URL not set in .env"
    exit 1
fi

echo "📦 Supabase Project: $VITE_SUPABASE_URL"
echo ""

# Extract project ref from URL
PROJECT_REF=$(echo $VITE_SUPABASE_URL | sed 's/https:\/\///' | sed 's/.supabase.co//')

echo "🔧 Step 1: Pushing migration fix..."
echo "-----------------------------------"
npx supabase db push --linked --db-url "postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" || {
    echo ""
    echo "⚠️  Migration push failed or requires password"
    echo "Please run manually:"
    echo "npx supabase db push --linked -p [YOUR-DB-PASSWORD]"
    echo ""
}

echo ""
echo "📝 Step 2: Pushing seed data..."
echo "-----------------------------------"
echo "Please use ONE of these methods:"
echo ""
echo "Method 1 (Recommended): Via Supabase Dashboard"
echo "  1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/editor"
echo "  2. Click 'New Query'"
echo "  3. Copy contents of supabase/seed.sql"
echo "  4. Paste and click 'Run'"
echo ""
echo "Method 2: Via psql (if installed)"
echo "  psql \"postgresql://postgres:YOUR-PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres\" -f supabase/seed.sql"
echo ""
echo "Method 3: Via Supabase CLI"
echo "  npx supabase db push --linked --include-seed -p YOUR-PASSWORD"
echo ""
echo "========================================="
echo "For detailed instructions, see:"
echo "  PUSH_SEED_INSTRUCTIONS.md"
echo "========================================="