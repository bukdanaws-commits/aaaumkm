import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { District } from '@/types/supabase';

// GET /api/regions/districts?regencyId=1101 - Get districts by regency
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regencyId = searchParams.get('regencyId');

    if (!regencyId) {
      return NextResponse.json(
        { success: false, message: 'regencyId diperlukan' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: districts, error } = await findMany<District>(supabase, 'districts', {
      filters: { regencyId },
      orderBy: [{ column: 'name', ascending: true }],
      select: 'id, name',
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      districts: districts || [],
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data kecamatan' },
      { status: 500 }
    );
  }
}