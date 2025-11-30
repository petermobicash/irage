#!/bin/bash

# ===============================================
# BENIRAGE SUPABASE 404 ERRORS FIX SCRIPT
# ===============================================
# This script fixes the HTTP 404 errors for missing content tables
# 
# Usage: ./fix_supabase_404_errors.sh
# Or: bash fix_supabase_404_errors.sh

set -e  # Exit on any error

echo "🔧 BENIRAGE SUPABASE 404 ERRORS FIX"
echo "==================================="
echo ""

# Check if required environment variables exist
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  Environment variables not found. Checking .env file..."
    
    if [ -f ".env" ]; then
        echo "📄 Loading .env file..."
        export $(cat .env | grep -v '^#' | xargs)
    else
        echo "❌ No .env file found and required variables not set"
        echo ""
        echo "📋 Please set these environment variables:"
        echo "   VITE_SUPABASE_URL=https://your-project.supabase.co"
        echo "   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
        echo ""
        echo "💡 Get them from: https://supabase.com/dashboard → Settings → API"
        exit 1
    fi
fi

echo "✅ Environment variables loaded"
echo "   URL: $VITE_SUPABASE_URL"
echo ""

# Check if Node.js dependencies are available
echo "📦 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if [ ! -f "node_modules/@supabase/supabase-js/package.json" ]; then
    echo "📥 Installing Node.js dependencies..."
    npm install
fi

# Run the fix
echo "🚀 Applying Supabase content tables fix..."
node apply_content_tables_fix.js

echo ""
echo "🧪 Testing the fix..."
node test_content_tables.js

echo ""
echo "✨ Fix script completed!"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. Check the test results above"
echo "   2. Refresh your web application"
echo "   3. The 404 errors should be resolved"
echo ""
echo "📚 For more information, see: SUPABASE_404_ERRORS_FIX.md"