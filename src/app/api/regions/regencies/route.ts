import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { Regency } from '@/types/supabase';

// GET /api/regions/regencies?provinceId=11 - Get regencies by province
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('provinceId');

    if (!provinceId) {
      return NextResponse.json(
        { success: false, message: 'provinceId diperlukan' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: regencies, error } = await findMany<Regency>(supabase, 'regencies', {
      filters: { provinceId },
      orderBy: [{ column: 'name', ascending: true }],
      select: 'id, name, type',
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      regencies: regencies || [],
    });
  } catch (error) {
    console.error('Error fetching regencies:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data kabupaten/kota' },
      { status: 500 }
    );
  }
}