import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { Province } from '@/types/supabase';

// GET /api/regions/provinces - Get all provinces
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: provinces, error } = await findMany<Province>(supabase, 'provinces', {
      orderBy: [{ column: 'name', ascending: true }],
      select: 'id, name',
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      provinces: provinces || [],
    });
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data provinsi' },
      { status: 500 }
    );
  }
}