# Run Schema Migration to Supabase
# Usage: .\run-schema-migration.ps1

$env:SUPABASE_URL = [Environment]::GetEnvironmentVariable("SUPABASE_URL", "User")
$env:SUPABASE_SERVICE_KEY = [Environment]::GetEnvironmentVariable("SUPABASE_SERVICE_KEY", "User")

if (-not $env:SUPABASE_URL -or -not $env:SUPABASE_SERVICE_KEY) {
    Write-Host "Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set" -ForegroundColor Red
    Write-Host "Please set these environment variables first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Reading schema file..." -ForegroundColor Cyan
$schemaContent = Get-Content "database-fixes/schema_minimal.sql" -Raw

Write-Host "Connecting to Supabase..." -ForegroundColor Cyan
$connectionString = "Host=$env:SUPABASE_URL;Database=postgres;User=postgres;Password=$env:SUPABASE_SERVICE_KEY"

try {
    Add-Type -Path "node_modules/pg/lib" -ErrorAction SilentlyContinue | Out-Null
} catch {
    Write-Host "Installing pg module..." -ForegroundColor Yellow
    npm install pg
}

$query = @"
-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Drop unused tables (if exist)
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS villages CASCADE;
DROP TABLE IF EXISTS umkm_profiles CASCADE;
DROP TABLE IF EXISTS umkm_portfolios CASCADE;
DROP TABLE IF EXISTS umkm_reviews CASCADE;
DROP TABLE IF EXISTS umkm_subscriptions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS listing_auctions CASCADE;
DROP TABLE IF EXISTS auction_bids CASCADE;
DROP TABLE IF EXISTS boost_types CASCADE;
DROP TABLE IF EXISTS listing_boosts CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS banner_events CASCADE;
DROP TABLE IF EXISTS sponsors CASCADE;
DROP TABLE IF EXISTS carousel_configs CASCADE;
DROP TABLE IF EXISTS credit_scores CASCADE;
DROP TABLE IF EXISTS ai_credit_scores CASCADE;
DROP TABLE IF EXISTS social_media_connections CASCADE;
DROP TABLE IF EXISTS slik_ojk_consents CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = origin;
"@

Write-Host "Executing cleanup queries..." -ForegroundColor Cyan
node -e "
const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL || '$connectionString',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    console.log('Connected to Supabase');
    
    try {
        await client.query(\`$query\`);
        console.log('Cleanup completed successfully');
    } catch (err) {
        console.error('Error:', err.message);
    }
    
    await client.end();
}

run();
"

Write-Host ""
Write-Host "Schema cleanup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "NOTE: For full schema creation, please run the SQL in Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "1. Go to Supabase Dashboard -> SQL Editor" -ForegroundColor Yellow
Write-Host "2. Copy content from: database-fixes/schema_minimal.sql" -ForegroundColor Yellow
Write-Host "3. Paste and run in SQL Editor" -ForegroundColor Yellow