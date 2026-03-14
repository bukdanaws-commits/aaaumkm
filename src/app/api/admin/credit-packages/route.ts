import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, findOne, create, update } from '@/lib/supabase-queries';

// Helper function to check if user is admin
async function checkAdminRole(supabase: any, userId: string): Promise<boolean> {
  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();
  
  return !error && !!userRole;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const adminSupabase = getSupabaseClient();
    
    const filters: Record<string, any> = {};
    if (activeOnly) {
      filters.is_active = true;
    }

    const { data: packages } = await findMany(adminSupabase, 'credit_packages', {
      filters,
      orderBy: [{ column: 'sort_order', ascending: true }],
    });

    return NextResponse.json({ packages: packages || [] });
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      userId = authHeader.substring(7);
    } else {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabaseClient, userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, credits, price, bonusCredits, isActive, sortOrder } = body;

    if (!name || !credits || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminSupabase = getSupabaseClient();
    const { data: newPackage, error } = await create(adminSupabase, 'credit_packages', {
      name,
      credits: parseInt(credits),
      price: parseFloat(price),
      bonus_credits: parseInt(bonusCredits) || 0,
      is_active: isActive !== false,
      sort_order: parseInt(sortOrder) || 0,
    });

    if (error) throw error;

    return NextResponse.json({ package: newPackage });
  } catch (error) {
    console.error('Error creating credit package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check for demo/mock authentication (development mode)
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      userId = authHeader.substring(7);
    } else {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabaseClient, userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, credits, price, bonusCredits, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (credits !== undefined) updateData.credits = parseInt(credits);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (bonusCredits !== undefined) updateData.bonus_credits = parseInt(bonusCredits);
    if (isActive !== undefined) updateData.is_active = isActive;
    if (sortOrder !== undefined) updateData.sort_order = parseInt(sortOrder);

    const adminSupabase = getSupabaseAdmin();
    const { data: updatedPackage, error } = await update(adminSupabase, 'credit_packages', id, updateData);

    if (error) throw error;

    return NextResponse.json({ package: updatedPackage });
  } catch (error) {
    console.error('Error updating credit package:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
