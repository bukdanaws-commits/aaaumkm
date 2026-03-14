import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserRoles, checkUserRole } from '@/lib/auth/checkRole';

// GET /api/auth/check-role - Check current user's roles
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all roles for the user
    const roles = await getUserRoles(user.id);
    
    // Check specific roles
    const isAdmin = await checkUserRole(user.id, 'admin');
    const isPenjual = await checkUserRole(user.id, 'penjual');

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      roles,
      isAdmin,
      isPenjual,
    });
  } catch (error) {
    console.error('Error checking role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
