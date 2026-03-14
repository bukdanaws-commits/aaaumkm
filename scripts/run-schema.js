#!/usr/bin/env node
/**
 * Run Schema Migration to Supabase
 * Usage: node scripts/run-schema.js
 * 
 * Requires environment variables:
 * - SUPABASE_URL (e.g., https://xxxxx.supabase.co)
 * - SUPABASE_SERVICE_KEY (service_role key)
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
    console.log('\nUsage:');
    console.log('  export SUPABASE_URL="https://xxxxx.supabase.co"');
    console.log('  export SUPABASE_SERVICE_KEY="service_role_key_here"');
    console.log('  node scripts/run-schema.js\n');
    process.exit(1);
  }

  // Extract host from URL
  const host = supabaseUrl.replace('https://', '').replace('/', '');
  
  const client = new Client({
    host: host,
    database: 'postgres',
    user: 'postgres',
    password: serviceKey,
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connecting to Supabase...');
  
  try {
    await client.connect();
    console.log('Connected successfully!\n');

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database-fixes', 'schema_minimal.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema migration...');
    
    // Execute in batches (split by semicolons)
    const statements = schemaContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        await client.query(statement);
        successCount++;
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists') && 
            !err.message.includes('duplicate key')) {
          console.error('Error:', err.message.substring(0, 100));
        }
        errorCount++;
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`  - Successful: ${successCount}`);
    console.log(`  - Errors (expected for existing objects): ${errorCount}`);
    
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();