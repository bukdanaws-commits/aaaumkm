import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { findMany, findOne, update, upsert } from '@/lib/supabase-queries';
import { checkUserRole } from '@/lib/auth/checkRole';
import { logActivity } from '@/lib/activityLog';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminSupabase = getSupabaseClient();

    // Fetch boost types
    const { data: boostTypes } = await findMany(adminSupabase, 'boost_types', {
      orderBy: [{ column: 'credits_per_day', ascending: true }],
    });

    // Fetch all platform settings
    const { data: allSettings } = await findMany(adminSupabase, 'platform_settings', {
      orderBy: [{ column: 'key', ascending: true }],
    });

    // Filter credit-related settings
    const creditSettings = (allSettings || []).filter(
      (s: any) =>
        (s.key.includes('credit') ||
          s.key.includes('cost') ||
          s.key.includes('fee') ||
          s.key.includes('initial')) &&
        s.key !== 'premium_homepage_count'
    );

    // Get premium homepage count
    const premiumHomepageSetting = (allSettings || []).find(
      (s: any) => s.key === 'premium_homepage_count'
    );
    let premiumCount = 6;
    if (premiumHomepageSetting?.value) {
      try {
        const parsed = typeof premiumHomepageSetting.value === 'string' 
          ? JSON.parse(premiumHomepageSetting.value) 
          : premiumHomepageSetting.value;
        if (parsed.amount) premiumCount = parsed.amount;
      } catch {
        // Use default
      }
    }

    // Fetch active boosts
    const { data: activeBoosts } = await findMany(adminSupabase, 'listing_boosts', {
      filters: {
        status: 'active',
        ends_at: { gte: new Date().toISOString() },
      },
      orderBy: [{ column: 'created_at', ascending: false }],
      limit: 20,
    });

    return NextResponse.json({
      boostTypes: boostTypes || [],
      creditSettings,
      premiumCount,
      activeBoosts: activeBoosts || [],
    });
  } catch (error) {
    console.error('Error fetching boost settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkUserRole(user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, data } = body;

    const adminSupabase = getSupabaseClient();

    if (action === 'update_boost_type') {
      // Update boost type
      const { id, name, description, creditsPerDay, multiplier, isActive } = data;
      
      await update(adminSupabase, 'boost_types', id, {
        name,
        description,
        credits_per_day: creditsPerDay,
        multiplier,
        is_active: isActive,
      });

      await logActivity({
        userId: user.id,
        userEmail: user.email || '',
        action: 'update_boost_type',
        description: `Memperbarui tipe boost: ${name}`,
        metadata: { boostTypeId: id },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'update_platform_setting') {
      // Update platform setting
      const { id, value } = data;
      
      await update(adminSupabase, 'platform_settings', id, {
        value: JSON.stringify(value),
        updated_by: user.id,
      });

      await logActivity({
        userId: user.id,
        userEmail: user.email || '',
        action: 'update_platform_setting',
        description: 'Memperbarui pengaturan platform',
        metadata: { settingId: id },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'update_premium_count') {
      // Update premium homepage count
      const { count } = data;
      
      // Check if setting exists
      const { data: existingSetting } = await findOne(adminSupabase, 'platform_settings', id || 'premium_homepage_count');
      
      if (existingSetting) {
        await update(adminSupabase, 'platform_settings', existingSetting.id, {
          value: JSON.stringify({ amount: count }),
          updated_by: user.id,
        });
      } else {
        await upsert(adminSupabase, 'platform_settings', {
          key: 'premium_homepage_count',
          value: JSON.stringify({ amount: count }),
          description: 'Jumlah card premium di homepage',
          updated_by: user.id,
        });
      }

      await logActivity({
        userId: user.id,
        userEmail: user.email || '',
        action: 'update_premium_count',
        description: `Mengubah jumlah card premium di homepage: ${count}`,
        metadata: { count },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error saving boost settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
