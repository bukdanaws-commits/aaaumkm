import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { Village } from '@/types/supabase';

// GET /api/regions/villages?districtId=110101 - Get villages by district
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');

    if (!districtId) {
      return NextResponse.json(
        { success: false, message: 'districtId diperlukan' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: villages, error } = await findMany<Village>(supabase, 'villages', {
      filters: { districtId },
      orderBy: [{ column: 'name', ascending: true }],
      select: 'id, name, type, postalCode',
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      villages: villages || [],
    });
  } catch (error) {
    console.error('Error fetching villages:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data desa/kelurahan' },
      { status: 500 }
    );
  }
}