import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany } from '@/lib/supabase-queries';
import { Sponsor } from '@/types/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: sponsors, error } = await findMany<Sponsor>(supabase, 'sponsors', {
      filters: { isActive: true },
      orderBy: [{ column: 'sortOrder', ascending: true }],
      select: 'id, name, logoUrl, website, category, isActive, sortOrder',
    });

    if (error) throw error;

    return NextResponse.json(sponsors || []);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sponsors' },
      { status: 500 }
    );
  }
}