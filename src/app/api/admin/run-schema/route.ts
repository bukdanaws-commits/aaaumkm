import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Only allow in development
export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is not available in production' },
      { status: 403 }
    );
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set' },
        { status: 500 }
      );
    }

    // Create admin client
    const supabase = createClient(supabaseUrl, serviceKey);

    // Read schema file
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.join(process.cwd(), 'database-fixes', 'schema_minimal.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');

    // Split by CREATE TABLE statements and execute each
    const statements = schemaContent
      .split(/CREATE\s+(?:TABLE|EXTENSION|TYPE|FUNCTION|INDEX)/i)
      .filter(s => s.trim().length > 10);

    const results = [];
    
    for (const statement of statements) {
      if (statement.trim().length < 10) continue;
      
      const fullStatement = 'CREATE ' + statement.trim();
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: fullStatement });
        
        if (error) {
          // Try alternative: use pg_terminate_backend if available
          if (error.message.includes('does not exist') || 
              error.message.includes('already exists')) {
            results.push({ status: 'skipped', message: error.message.substring(0, 50) });
          } else {
            results.push({ status: 'error', message: error.message });
          }
        } else {
          results.push({ status: 'success' });
        }
      } catch (err: any) {
        results.push({ status: 'error', message: err.message });
      }
    }

    return NextResponse.json({
      message: 'Schema migration completed',
      results: results,
      note: 'For best results, run SQL directly in Supabase Dashboard SQL Editor'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}