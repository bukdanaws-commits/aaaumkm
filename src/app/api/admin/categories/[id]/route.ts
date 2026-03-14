import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-client';
import { findOne, findMany, update, create, remove, count } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity } from '@/lib/activityLog';
import { Category } from '@/types/supabase';

// PATCH /api/admin/categories/[id] - Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params;

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

    // Get category
    const { data: category, error: findError } = await findOne<Category>(supabaseAdmin, 'categories', id);

    if (findError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, slug, description, iconUrl, parentId, isActive, isFeatured, sortOrder } = body;

    // If slug is being changed, check if it already exists
    if (slug && slug !== category.slug) {
      const { data: existing, error: existingError } = await findOne<Category>(supabaseAdmin, 'categories', slug);
      
      if (existingError === null && existing) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // Update category
    const { data: updatedCategory, error: updateError } = await update<Category>(supabaseAdmin, 'categories', id, updateData);

    if (updateError) throw updateError;

    // Log activity
    await logActivity({
      userId: user.id,
      userEmail: user.email || 'admin',
      action: 'category_updated',
      description: `Mengupdate kategori: ${updatedCategory?.name || name}`,
      metadata: {
        categoryId: id,
        categoryName: updatedCategory?.name || name,
        changes: body,
      }
    });

    return NextResponse.json({
      success: true,
      category: updatedCategory,
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params;

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

    // Get category
    const { data: category, error: findError } = await findOne<Category>(supabaseAdmin, 'categories', id);

    if (findError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has subcategories
    const { count: subcategories, error: countError } = await count(supabaseAdmin, 'categories', { parentId: id });
    if (countError) throw countError;

    if (subcategories > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories' },
        { status: 400 }
      );
    }

    // Check if category has listings
    if (category.listingCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with listings' },
        { status: 400 }
      );
    }

    // Delete category
    const { error: deleteError } = await remove(supabaseAdmin, 'categories', id);
    if (deleteError) throw deleteError;

    // Log activity
    await logActivity({
      userId: user.id,
      userEmail: user.email || 'admin',
      action: 'category_deleted',
      description: `Menghapus kategori: ${category.name}`,
      metadata: {
        categoryId: id,
        categoryName: category.name,
      }
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}