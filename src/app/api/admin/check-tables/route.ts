import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all tables
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .order('tablename');

    if (error) {
      // Try alternative query
      const { data: altData, error: altError } = await supabase
        .rpc('exec_sql', { 
          sql: "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename" 
        });
      
      if (altError) {
        return NextResponse.json({
          tables: [],
          message: 'Cannot list tables - run scripts/check-tables.js locally',
          note: 'Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables'
        });
      }
    }

    return NextResponse.json({
      tables: tables?.map(t => t.tablename) || [],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}