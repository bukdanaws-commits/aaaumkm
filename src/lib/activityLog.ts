import { getSupabaseAdmin } from '@/lib/supabase-client';
import { create } from '@/lib/supabase-queries';
import { ActivityLog } from '@/types/supabase';

export interface LogActivityParams {
  userId: string;
  userEmail: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Log user activity to database
 */
export async function logActivity(params: LogActivityParams) {
  try {
    const supabase = getSupabaseAdmin();
    await create<ActivityLog>(supabase, 'activity_logs', {
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      description: params.description,
      ipAddress: params.ipAddress || 'unknown',
      userAgent: params.userAgent || 'unknown',
      metadata: params.metadata || {},
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error, just log it
    // We don't want to break the main flow if logging fails
  }
}

/**
 * Common activity types
 */
export const ActivityType = {
  // Listing
  CREATE_LISTING: 'create_listing',
  UPDATE_LISTING: 'update_listing',
  DELETE_LISTING: 'delete_listing',
  BOOST_LISTING: 'boost_listing',
  
  // Order
  PLACE_ORDER: 'place_order',
  CONFIRM_ORDER: 'confirm_order',
  CANCEL_ORDER: 'cancel_order',
  COMPLETE_ORDER: 'complete_order',
  
  // KYC
  SUBMIT_KYC: 'submit_kyc',
  APPROVE_KYC: 'approve_kyc',
  REJECT_KYC: 'reject_kyc',
  
  // Wallet
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  
  // Credits
  BUY_CREDITS: 'buy_credits',
  USE_CREDITS: 'use_credits',
  
  // Auth
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  
  // Admin
  ADMIN_ACCESS: 'admin_access',
  ADMIN_ACTION: 'admin_action',
} as const;
