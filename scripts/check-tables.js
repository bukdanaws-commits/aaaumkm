#!/usr/bin/env node
/**
 * Check which tables exist in Supabase
 * Usage: node scripts/check-tables.js
 */

const { Client } = require('pg');

async function checkTables() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
    console.log('\nUsage:');
    console.log('  export SUPABASE_URL="https://xxxxx.supabase.co"');
    console.log('  export SUPABASE_SERVICE_KEY="service_role_key_here"');
    console.log('  node scripts/check-tables.js\n');
    process.exit(1);
  }

  const host = supabaseUrl.replace('https://', '').replace('/', '');
  
  const client = new Client({
    host: host,
    database: 'postgres',
    user: 'postgres',
    password: serviceKey,
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connecting to Supabase...\n');
  
  try {
    await client.connect();

    // Tables that SHOULD exist (used in app)
    const requiredTables = [
      'profiles', 'user_roles', 'kyc_verifications', 'kyc_documents',
      'wallets', 'transactions', 'withdrawals',
      'user_credits', 'credit_transactions', 'credit_packages', 'credit_topup_requests', 'coupons', 'coupon_uses',
      'categories', 'listings', 'listing_images', 'saved_listings', 'listing_reports',
      'orders', 'order_status_history', 'seller_reviews',
      'conversations', 'messages',
      'notifications',
      'support_tickets', 'ticket_replies',
      'activity_logs',
      'provinces', 'regencies'
    ];

    // Tables that should be DELETED (unused)
    const unusedTables = [
      'districts', 'villages',
      'umkm_profiles', 'umkm_portfolios', 'umkm_reviews', 'umkm_subscriptions',
      'products', 'product_images', 'product_reviews',
      'listing_auctions', 'auction_bids',
      'boost_types', 'listing_boosts',
      'banners', 'banner_events',
      'sponsors', 'carousel_configs',
      'credit_scores', 'ai_credit_scores',
      'social_media_connections', 'slik_ojk_consents',
      'testimonials',
      'platform_settings',
      'audit_logs'
    ];

    // Get all tables
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const existingTables = result.rows.map(r => r.tablename);

    console.log('=== TABLES IN SUPABASE ===\n');

    // Check required tables
    console.log('✓ REQUIRED TABLES (should exist):');
    let missingRequired = [];
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        console.log(`  ✓ ${table}`);
      } else {
        console.log(`  ✗ ${table} - MISSING!`);
        missingRequired.push(table);
      }
    }

    console.log('\n✗ UNUSED TABLES (should be deleted):');
    let stillExists = [];
    for (const table of unusedTables) {
      if (existingTables.includes(table)) {
        console.log(`  ✗ ${table} - STILL EXISTS!`);
        stillExists.push(table);
      } else {
        console.log(`  ✓ ${table} - deleted`);
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total tables: ${existingTables.length}`);
    console.log(`Required tables missing: ${missingRequired.length}`);
    console.log(`Unused tables still exist: ${stillExists.length}`);

    if (stillExists.length > 0) {
      console.log('\n⚠️  To delete unused tables, run this SQL in Supabase Dashboard:');
      console.log('\nDROP TABLE IF EXISTS ' + stillExists.join(' CASCADE;\nDROP TABLE IF EXISTS ') + ' CASCADE;');
    }

    await client.end();
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkTables();