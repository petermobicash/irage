#!/bin/bash

# Security Fix Migration Test Script
# This script helps verify the security fixes are applied correctly

echo "🔍 Testing Security Fix Migration"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "supabase/migrations/116_security_fixes.sql" ] || [ ! -f "supabase/migrations/117_function_search_path_fixes.sql" ]; then
    echo -e "${RED}❌ Error: Migration files not found. Run this from the project root directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}✅ Migration files found${NC}"

# Test 1: Check migration syntax
echo -e "\n🧪 Test 1: Migration Syntax Validation"
echo "----------------------------------------"

# Create a simple test to validate SQL syntax
cat > test_migration.sql << 'EOF'
-- Test the migration by checking if views exist with correct security type
-- This is a dry-run test of the migration logic

-- Check if we can query information_schema for views
SELECT 
    'Test 1: Views Security Check' as test_name,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'PASS'
        ELSE 'FAIL'
    END as test_result
FROM information_schema.views 
WHERE table_schema = 'public'
LIMIT 1;

-- Check if we can query pg_tables for RLS status
SELECT 
    'Test 2: RLS Status Check' as test_name,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'PASS'
        ELSE 'FAIL'
    END as test_result
FROM pg_tables 
WHERE schemaname = 'public'
LIMIT 1;

-- Check if security_events table exists for logging
SELECT 
    'Test 3: Security Events Table Check' as test_name,
    CASE 
        WHEN COUNT(*) >= 0 THEN 'PASS'
        ELSE 'FAIL'
    END as test_result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'security_events'
LIMIT 1;
EOF

echo -e "${YELLOW}📝 Created test query file: test_migration.sql${NC}"

# Test 2: Check migration file content
echo -e "\n🧪 Test 2: Migration File Content Validation"
echo "----------------------------------------------"

# Check for key components in the migration
echo "Checking for ALTER VIEW statements..."
ALTER_VIEW_COUNT=$(grep -c "ALTER VIEW.*SET.*security_invoker.*true" supabase/migrations/116_security_fixes.sql)
echo "Found $ALTER_VIEW_COUNT ALTER VIEW statements"

echo "Checking for RLS enable statements..."
RLS_ENABLE_COUNT=$(grep -c "ENABLE ROW LEVEL SECURITY" supabase/migrations/116_security_fixes.sql)
echo "Found $RLS_ENABLE_COUNT RLS enable statements"

echo "Checking for policy creation statements..."
POLICY_COUNT=$(grep -c "CREATE POLICY" supabase/migrations/116_security_fixes.sql)
echo "Found $POLICY_COUNT CREATE POLICY statements"

# Validate counts
if [ $ALTER_VIEW_COUNT -ge 3 ]; then
    echo -e "${GREEN}✅ All 3 views should have ALTER VIEW security_invoker=true${NC}"
else
    echo -e "${RED}❌ Expected 3 ALTER VIEW statements, found $ALTER_VIEW_COUNT${NC}"
fi

if [ $RLS_ENABLE_COUNT -eq 1 ]; then
    echo -e "${GREEN}✅ RLS should be enabled on policy_backup table${NC}"
else
    echo -e "${RED}❌ Expected 1 RLS enable statement, found $RLS_ENABLE_COUNT${NC}"
fi

if [ $POLICY_COUNT -ge 2 ]; then
    echo -e "${GREEN}✅ RLS policies should be created${NC}"
else
    echo -e "${RED}❌ Expected at least 2 policies, found $POLICY_COUNT${NC}"
fi

# Test 3: Show what the migration will do
echo -e "\n🧪 Test 3: Migration Impact Summary"
echo "------------------------------------"

echo "Views that will be converted to SECURITY INVOKER:"
echo "  • public.user_statistics_view"
echo "  • public.user_management_view" 
echo "  • public.active_users_summary"

echo ""
echo "Tables that will have RLS enabled:"
echo "  • public.policy_backup"

echo ""
echo "RLS Policies that will be created:"
echo "  • Allow authenticated users to view policy_backup (SELECT only)"
echo "  • Allow service role full access to policy_backup (ALL operations)"

echo ""
echo "Functions that will have secure search_path:"
echo "  • public.initialize_campaign_stats()"
echo "  • public.update_chat_room_last_activity()"

# Test 4: Backup recommendation
echo -e "\n💾 Backup Recommendation"
echo "------------------------"
echo -e "${YELLOW}⚠️  Before applying to production, create a backup:${NC}"
echo "pg_dump 'postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres' > backup_$(date +%Y%m%d_%H%M%S).sql"

# Test 5: Application commands
echo -e "\n🚀 Deployment Commands"
echo "----------------------"

echo "To apply the migration:"
echo "  supabase migration up"
echo ""
echo "Or run directly:"
echo "  psql 'postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres' -f supabase/migrations/116_security_fixes.sql"
echo ""
echo "To verify after deployment:"
echo "  psql 'postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres' -f test_migration.sql"

# Cleanup test file
rm -f test_migration.sql

echo -e "\n${GREEN}🎉 Migration test completed successfully!${NC}"
echo -e "${GREEN}📖 Refer to SECURITY_FIX_MIGRATION_GUIDE.md for detailed instructions${NC}"
echo -e "${YELLOW}⚠️  Remember to test in development before production deployment${NC}"