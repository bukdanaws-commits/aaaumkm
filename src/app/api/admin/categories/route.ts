import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-client';
import { findMany, findOne, create } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity, ActivityType } from '@/lib/activityLog';
import { Category } from '@/types/supabase';

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get all categories
    const { data: categories, error } = await findMany<Category>(supabaseAdmin, 'categories', {
      orderBy: [
        { column: 'sortOrder', ascending: true },
        { column: 'name', ascending: true }
      ],
    });

    if (error) throw error;

    return NextResponse.json({
      categories: categories || [],
      total: (categories || []).length,
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, slug, description, iconUrl, parentId, isActive, isFeatured, sortOrder } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if slug already exists
    const { data: existing, error: findError } = await findOne<Category>(supabaseAdmin, 'categories', slug);

    if (findError === null && existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Create category
    const { data: category, error: createError } = await create<Category>(supabaseAdmin, 'categories', {
      name,
      slug,
      description: description || null,
      iconUrl: iconUrl || null,
      parentId: parentId || null,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      sortOrder: sortOrder || 0,
      listingCount: 0,
    });

    if (createError) throw createError;

    // Log activity
    await logActivity({
      userId: user.id,
      userEmail: user.email || 'admin',
      action: 'category_created',
      description: `Membuat kategori baru: ${name}`,
      metadata: {
        categoryId: category.id,
        categoryName: name,
        slug,
      }
    });

    return NextResponse.json({
      success: true,
      category,
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}