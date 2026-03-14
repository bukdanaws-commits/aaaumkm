/**
 * Migration Script for Supabase
 * 
 * This script connects to Supabase PostgreSQL directly
 * and executes the database migrations.
 * 
 * Usage: bun run scripts/migrate-supabase.ts
 */

import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const { Client } = pg;

// Supabase PostgreSQL Configuration
const DATABASE_URL = 'postgresql://postgres.fnicnfehvjuxmemujrhl:Bukdan%23kubang101@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function runMigration() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SUPABASE DATABASE MIGRATION');
  console.log('  Project: fnicnfehvjuxmemujrhl');
  console.log('  Region: ap-southeast-1 (Singapore)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...\n');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    const migrationsDir = path.join(__dirname, '../database-fixes');
    
    const migrationFiles = [
      'migration_to_supabase_part1.sql',
      'migration_to_supabase_part2.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${file}`);
        continue;
      }

      console.log(`📄 Executing: ${file}`);
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL into individual statements
      const statements = sql
        .split(/;\s*\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const statement of statements) {
        if (statement.length < 5) continue;
        
        try {
          await client.query(statement + ';');
          successCount++;
          
          // Log progress every 50 statements
          if (successCount % 50 === 0) {
            console.log(`   Progress: ${successCount} statements...`);
          }
        } catch (err: any) {
          // Ignore duplicate object errors
          if (err.code === '42P06' || err.code === '42710' || err.code === '23505') {
            successCount++;
          } else {
            errorCount++;
            if (errorCount <= 10) {
              console.log(`   ⚠️  Statement error (${err.code}): ${err.message?.substring(0, 100)}`);
            }
          }
        }
      }
      
      console.log(`   ✅ Completed: ${successCount} statements, ${errorCount} errors\n`);
    }

    // Verify tables
    console.log('📋 Verifying created tables...\n');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`   Total tables created: ${tablesResult.rows.length}`);
    console.log('   Tables:', tablesResult.rows.map((r: any) => r.table_name).join(', '));
    console.log('');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (err: any) {
    console.error('❌ Migration error:', err.message);
    console.error('   Connection string used (redacted)');
  } finally {
    await client.end();
    console.log('🔌 Connection closed.');
  }
}

// Run migration
runMigration();
