#!/bin/bash

# ============================================================
# Migration Script for Supabase
# Project: fnicnfehvjuxmemujrhl
# ============================================================

echo "═══════════════════════════════════════════════════════════"
echo "  SUPABASE DATABASE MIGRATION"
echo "  Project: fnicnfehvjuxmemujrhl"
echo "  Region: ap-southeast-1 (Singapore)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Database connection string
DB_URL="postgresql://postgres.fnicnfehvjuxmemujrhl:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client."
    echo ""
    echo "📝 Alternative: Use Supabase Dashboard SQL Editor"
    echo "   1. Open: https://supabase.com/dashboard/project/fnicnfehvjuxmemujrhl/sql/new"
    echo "   2. Copy contents of migration_to_supabase_part1.sql"
    echo "   3. Click Run"
    echo "   4. Then copy and run migration_to_supabase_part2.sql"
    exit 1
fi

# Run migrations
echo "📄 Running migration part 1..."
PGPASSWORD='Bukdan#kubang101' psql -h aws-1-ap-southeast-1.pooler.supabase.com -p 5432 -U postgres.fnicnfehvjuxmemujrhl -d postgres -f database-fixes/migration_to_supabase_part1.sql

echo ""
echo "📄 Running migration part 2..."
PGPASSWORD='Bukdan#kubang101' psql -h aws-1-ap-southeast-1.pooler.supabase.com -p 5432 -U postgres.fnicnfehvjuxmemujrhl -d postgres -f database-fixes/migration_to_supabase_part2.sql

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🎉 MIGRATION COMPLETED"
echo "═══════════════════════════════════════════════════════════"
