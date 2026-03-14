/**
 * Supabase Client Configuration
 * 
 * Environment Variables needed:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - SUPABASE_SERVICE_ROLE_KEY (server-side only)
 */

import { createClient } from '@supabase/supabase-js';

// Client-side configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fnicnfehvjuxmemujrhl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuaWNuZmVodmp1eG1lbXVqcmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNTY5NzgsImV4cCI6MjA4NzgzMjk3OH0.SW8Jzr6p_gr5v1QJ1Zu_YcltCAXeyfDaPVo4Gz91mMY';

// Browser client (for client-side usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Server-side admin client (use only in API routes)
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
  }
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          name: string | null;
          phone_number: string | null;
          avatar_url: string | null;
          is_active: boolean;
          total_listings: number;
          average_rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email?: string | null;
          name?: string | null;
          phone_number?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
        };
        Update: {
          email?: string | null;
          name?: string | null;
          phone_number?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
        };
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          title: string;
          slug: string | null;
          description: string | null;
          price: number;
          price_type: 'fixed' | 'negotiable' | 'auction';
          listing_type: 'sale' | 'rent' | 'service' | 'wanted';
          status: 'draft' | 'pending_review' | 'active' | 'sold' | 'expired' | 'rejected' | 'deleted';
          image_url: string | null;
          view_count: number;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          title: string;
          slug?: string;
          description?: string;
          price?: number;
          price_type?: 'fixed' | 'negotiable' | 'auction';
          listing_type?: 'sale' | 'rent' | 'service' | 'wanted';
          status?: 'draft' | 'pending_review' | 'active' | 'sold' | 'expired' | 'rejected' | 'deleted';
        };
        Update: {
          title?: string;
          description?: string;
          price?: number;
          status?: 'draft' | 'pending_review' | 'active' | 'sold' | 'expired' | 'rejected' | 'deleted';
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          icon_url: string | null;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          icon_url?: string | null;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
      };
      user_credits: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          lifetime_purchased: number;
          lifetime_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
        };
        Update: {
          balance?: number;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          currency_code: string;
          status: 'active' | 'frozen' | 'closed' | 'suspended';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
        };
      };
      umkm_profiles: {
        Row: {
          id: string;
          owner_id: string;
          umkm_name: string;
          brand_name: string | null;
          slug: string | null;
          description: string | null;
          category_id: string | null;
          business_scale: 'micro' | 'small' | 'medium' | 'large';
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          is_verified: boolean;
          status: 'pending' | 'active' | 'suspended' | 'closed' | 'rejected';
          view_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          umkm_name: string;
          brand_name?: string;
          description?: string;
        };
      };
      // Add more tables as needed
    };
    Views: Record<string, never>;
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: 'user' | 'admin' | 'penjual' };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: 'user' | 'admin' | 'penjual';
      listing_status: 'draft' | 'pending_review' | 'active' | 'sold' | 'expired' | 'rejected' | 'deleted';
      listing_price_type: 'fixed' | 'negotiable' | 'auction';
      listing_type: 'sale' | 'rent' | 'service' | 'wanted';
      auction_status: 'active' | 'ended' | 'sold' | 'cancelled' | 'no_winner';
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded' | 'failed';
      payment_status: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';
      kyc_status: 'not_submitted' | 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
      wallet_status: 'active' | 'frozen' | 'closed' | 'suspended';
      umkm_status: 'pending' | 'active' | 'suspended' | 'closed' | 'rejected';
      notification_type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'payment' | 'message' | 'listing' | 'promotion' | 'system';
    };
  };
}

// Typed client
export type SupabaseClient = ReturnType<typeof createClient<Database>>;

export default supabase;
