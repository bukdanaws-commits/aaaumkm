import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase-client';
import { findMany, findOne, update, create, upsert } from '@/lib/supabase-queries';
import { PlatformSetting, Profile } from '@/types/supabase';

// Helper function to check if user is admin
async function checkAdminRole(supabase: any, userId: string): Promise<boolean> {
  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('userId', userId)
    .eq('role', 'admin')
    .single();
  
  return !error && !!userRole;
}

// GET - Fetch platform settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabaseClient, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all settings
    const { data: settings, error: settingsError } = await findMany<PlatformSetting>(supabaseClient, 'platform_settings', {
      select: 'key, value, description',
    });

    if (settingsError) throw settingsError;

    // Convert to key-value object
    const settingsObj: Record<string, any> = {};
    (settings || []).forEach((setting) => {
      try {
        // Try to parse as JSON first
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        // If not JSON, use as string
        settingsObj[setting.key] = setting.value;
      }
    });

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Update platform settings
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient();
    const supabaseAdmin = getSupabaseAdmin();

    // Check if user is admin
    const isAdmin = await checkAdminRole(supabaseClient, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Convert value to string (JSON if object/array)
    const valueStr = typeof value === 'object' 
      ? JSON.stringify(value) 
      : String(value);

    // Check if setting exists
    const { data: existingSetting, error: findError } = await findOne<PlatformSetting>(supabaseClient, 'platform_settings', key);

    if (findError && findError.code !== 'PGRST116') {
      throw findError;
    }

    if (existingSetting) {
      // Update existing setting
      await update<PlatformSetting>(supabaseAdmin, 'platform_settings', key, {
        value: valueStr,
        description: description || existingSetting.description,
        updatedBy: user.id,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new setting
      await create<PlatformSetting>(supabaseAdmin, 'platform_settings', {
        key,
        value: valueStr,
        description: description || '',
        updatedBy: user.id,
      });
    }

    // Get user email for activity log
    const { data: userProfile, error: profileError } = await findOne<Profile>(supabaseClient, 'profiles', user.id);

    // Log the action
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const adminSupabase = await createServerClient();
    
    await adminSupabase.from('activity_logs').insert({
      userId: user.id,
      userEmail: userProfile?.email || '',
      action: 'update_setting',
      description: `Updated setting: ${key}`,
      metadata: {
        key,
        value: valueStr.substring(0, 100),
      },
    });

    return NextResponse.json({
      success: true,
      setting: { key, value: valueStr },
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}