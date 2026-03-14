/**
 * Complete Migration Script for Supabase
 * Executes SQL files directly via PostgreSQL connection
 */

import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const { Client } = pg;

async function migrate() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SUPABASE DATABASE MIGRATION');
  console.log('  Project: fnicnfehvjuxmemujrhl');
  console.log('  Region: ap-southeast-1 (Singapore)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const client = new Client({
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.fnicnfehvjuxmemujrhl',
    password: 'Bukdan#kubang101',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase\n');

    // Step 1: Enable extensions
    console.log('📦 Enabling extensions...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "unaccent"');
    console.log('   ✅ Extensions enabled\n');

    // Step 2: Create ENUM types
    console.log('📋 Creating ENUM types...');
    const enumTypes = [
      { name: 'app_role', values: ['user', 'admin', 'penjual'] },
      { name: 'listing_price_type', values: ['fixed', 'negotiable', 'auction'] },
      { name: 'listing_type', values: ['sale', 'rent', 'service', 'wanted'] },
      { name: 'listing_condition', values: ['new', 'like_new', 'good', 'fair', 'poor'] },
      { name: 'listing_status', values: ['draft', 'pending_review', 'active', 'sold', 'expired', 'rejected', 'deleted'] },
      { name: 'auction_status', values: ['active', 'ended', 'sold', 'cancelled', 'no_winner'] },
      { name: 'boost_type', values: ['highlight', 'top_search', 'premium'] },
      { name: 'boost_status', values: ['active', 'expired', 'cancelled'] },
      { name: 'credit_transaction_type', values: ['purchase', 'usage', 'refund', 'bonus', 'expired', 'topup', 'adjustment'] },
      { name: 'order_status', values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'failed'] },
      { name: 'payment_status', values: ['unpaid', 'pending', 'paid', 'failed', 'refunded', 'partial'] },
      { name: 'payment_method', values: ['bank_transfer', 'e_wallet', 'credit_card', 'cod', 'credit', 'va'] },
      { name: 'kyc_status', values: ['not_submitted', 'draft', 'pending', 'under_review', 'approved', 'rejected', 'expired'] },
      { name: 'document_type', values: ['ktp', 'npwp', 'siup', 'tdp', 'nib', 'akta', 'skdp', 'other'] },
      { name: 'wallet_status', values: ['active', 'frozen', 'closed', 'suspended'] },
      { name: 'transaction_type', values: ['topup', 'withdrawal', 'payment', 'refund', 'commission', 'bonus', 'transfer_in', 'transfer_out', 'adjustment'] },
      { name: 'withdrawal_status', values: ['pending', 'processing', 'approved', 'rejected', 'paid', 'failed', 'cancelled'] },
      { name: 'banner_position', values: ['hero', 'sidebar', 'inline', 'footer', 'category_top', 'search_top'] },
      { name: 'banner_status', values: ['pending', 'active', 'paused', 'expired', 'rejected'] },
      { name: 'banner_pricing_model', values: ['cpc', 'cpm', 'fixed'] },
      { name: 'report_reason', values: ['spam', 'fraud', 'inappropriate', 'wrong_category', 'duplicate', 'counterfeit', 'sold_elsewhere', 'other'] },
      { name: 'report_status', values: ['pending', 'reviewed', 'action_taken', 'dismissed'] },
      { name: 'umkm_status', values: ['pending', 'active', 'suspended', 'closed', 'rejected'] },
      { name: 'business_scale', values: ['micro', 'small', 'medium', 'large'] },
      { name: 'ticket_status', values: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'] },
      { name: 'ticket_priority', values: ['low', 'normal', 'high', 'urgent'] },
      { name: 'ticket_category', values: ['general', 'account', 'payment', 'listing', 'order', 'technical', 'report', 'suggestion'] },
      { name: 'notification_type', values: ['info', 'success', 'warning', 'error', 'order', 'payment', 'message', 'listing', 'promotion', 'system'] },
      { name: 'notification_channel', values: ['in_app', 'email', 'sms', 'whatsapp', 'push'] },
      { name: 'otp_channel', values: ['sms', 'whatsapp', 'email'] },
      { name: 'contact_preference', values: ['phone', 'whatsapp', 'email', 'in_app', 'all'] },
      { name: 'promo_type', values: ['regular', 'flash_sale', 'discount', 'bundle', 'free_shipping', 'cashback'] },
      { name: 'subscription_status', values: ['active', 'expired', 'cancelled', 'pending', 'grace_period'] }
    ];

    for (const enumType of enumTypes) {
      try {
        await client.query(`DROP TYPE IF EXISTS public.${enumType.name} CASCADE`);
        await client.query(`CREATE TYPE public.${enumType.name} AS ENUM (${enumType.values.map(v => `'${v}'`).join(', ')})`);
      } catch (e) {
        // Type might be in use
      }
    }
    console.log('   ✅ ENUM types created\n');

    // Step 3: Create utility functions
    console.log('⚙️  Creating utility functions...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await client.query(`
      CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
      RETURNS BOOLEAN AS $$
        SELECT EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = _user_id AND role = _role AND is_active = true
        );
      $$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;
    `);
    console.log('   ✅ Functions created\n');

    // Step 4: Create tables
    console.log('📊 Creating tables...');
    
    // Regions
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.provinces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.regencies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        province_id UUID REFERENCES public.provinces(id),
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.districts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        regency_id UUID REFERENCES public.regencies(id),
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.villages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        district_id UUID REFERENCES public.districts(id),
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        postal_code TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT,
        name TEXT,
        phone_number TEXT,
        address TEXT,
        avatar_url TEXT,
        primary_role TEXT DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        total_listings INTEGER DEFAULT 0,
        average_rating NUMERIC(3,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // User roles
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        role app_role NOT NULL DEFAULT 'user',
        assigned_by UUID,
        assigned_at TIMESTAMPTZ DEFAULT now(),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, role)
      )
    `);

    // KYC
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.kyc_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
        ktp_number TEXT,
        ktp_image_url TEXT,
        selfie_image_url TEXT,
        status kyc_status DEFAULT 'not_submitted',
        rejection_reason TEXT,
        reviewed_by UUID,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Wallet
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
        balance NUMERIC(15,2) DEFAULT 0,
        currency_code CHAR(3) DEFAULT 'IDR',
        status wallet_status DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        wallet_id UUID REFERENCES public.wallets(id),
        type transaction_type NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        description TEXT,
        reference_type TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Withdrawals
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.withdrawals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        wallet_id UUID REFERENCES public.wallets(id),
        amount NUMERIC(15,2) NOT NULL,
        bank_name TEXT,
        account_number TEXT,
        account_holder TEXT,
        status withdrawal_status DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // User Credits
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_credits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
        balance INTEGER DEFAULT 0,
        lifetime_purchased INTEGER DEFAULT 0,
        lifetime_used INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Credit Transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.credit_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type credit_transaction_type NOT NULL,
        amount INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Credit Packages
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.credit_packages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        credits INTEGER NOT NULL,
        price NUMERIC NOT NULL,
        bonus_credits INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Credit Topup Requests
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.credit_topup_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        package_id UUID REFERENCES public.credit_packages(id),
        amount NUMERIC NOT NULL,
        credits_amount INTEGER NOT NULL,
        proof_image_url TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Coupons
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL,
        credits_amount INTEGER DEFAULT 0,
        max_uses INTEGER DEFAULT 1,
        used_count INTEGER DEFAULT 0,
        expires_at TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Coupon Uses
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.coupon_uses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        credits_given INTEGER NOT NULL,
        used_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(coupon_id, user_id)
      )
    `);

    // Categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        parent_id UUID REFERENCES public.categories(id),
        icon_url TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Listings
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        category_id UUID REFERENCES public.categories(id),
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        description TEXT,
        price NUMERIC DEFAULT 0,
        price_type listing_price_type DEFAULT 'fixed',
        listing_type listing_type DEFAULT 'sale',
        condition listing_condition DEFAULT 'good',
        status listing_status DEFAULT 'draft',
        image_url TEXT,
        location_lat DOUBLE PRECISION,
        location_lng DOUBLE PRECISION,
        province_id UUID REFERENCES public.provinces(id),
        regency_id UUID REFERENCES public.regencies(id),
        city TEXT,
        address TEXT,
        view_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        featured_until TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,
        published_at TIMESTAMPTZ,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Listing Images
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.listing_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Saved Listings
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.saved_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, listing_id)
      )
    `);

    // Listing Reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.listing_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
        reporter_id UUID REFERENCES auth.users(id),
        reason report_reason NOT NULL,
        description TEXT,
        status report_status DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Listing Auctions
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.listing_auctions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,
        starting_price NUMERIC NOT NULL,
        current_price NUMERIC NOT NULL,
        min_increment NUMERIC DEFAULT 10000,
        buy_now_price NUMERIC,
        ends_at TIMESTAMPTZ NOT NULL,
        winner_id UUID REFERENCES auth.users(id),
        total_bids INTEGER DEFAULT 0,
        status auction_status DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Auction Bids
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.auction_bids (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auction_id UUID REFERENCES public.listing_auctions(id) ON DELETE CASCADE,
        bidder_id UUID REFERENCES auth.users(id),
        amount NUMERIC NOT NULL,
        is_winning BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Boost Types
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.boost_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type boost_type UNIQUE NOT NULL,
        name TEXT NOT NULL,
        credits_per_day INTEGER NOT NULL,
        multiplier NUMERIC DEFAULT 1,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Listing Boosts
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.listing_boosts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id),
        boost_type boost_type NOT NULL,
        credits_used INTEGER NOT NULL,
        starts_at TIMESTAMPTZ DEFAULT now(),
        ends_at TIMESTAMPTZ NOT NULL,
        status boost_status DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Banners
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.banners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        title TEXT NOT NULL,
        image_url TEXT NOT NULL,
        target_url TEXT NOT NULL,
        position banner_position DEFAULT 'inline',
        status banner_status DEFAULT 'pending',
        pricing_model banner_pricing_model DEFAULT 'cpc',
        budget_total NUMERIC DEFAULT 0,
        budget_spent NUMERIC DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        starts_at TIMESTAMPTZ DEFAULT now(),
        ends_at TIMESTAMPTZ,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // UMKM Profiles
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.umkm_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID UNIQUE REFERENCES auth.users(id),
        umkm_name TEXT NOT NULL,
        brand_name TEXT,
        slug TEXT UNIQUE,
        description TEXT,
        category_id UUID REFERENCES public.categories(id),
        business_scale business_scale DEFAULT 'micro',
        phone TEXT,
        whatsapp TEXT,
        email TEXT,
        website TEXT,
        province_id UUID REFERENCES public.provinces(id),
        regency_id UUID REFERENCES public.regencies(id),
        address TEXT,
        city TEXT,
        logo_url TEXT,
        banner_url TEXT,
        is_verified BOOLEAN DEFAULT false,
        status umkm_status DEFAULT 'pending',
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // UMKM Reviews
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.umkm_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        umkm_id UUID REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
        reviewer_id UUID REFERENCES auth.users(id),
        rating INTEGER NOT NULL,
        content TEXT,
        is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Products
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        umkm_id UUID REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
        category_id UUID REFERENCES public.categories(id),
        name TEXT NOT NULL,
        slug TEXT,
        description TEXT,
        price NUMERIC(12,2),
        stock INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Product Images
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.product_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Conversations
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
        buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        last_message_at TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(listing_id, buyer_id, seller_id)
      )
    `);

    // Messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT,
        type notification_type DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        data JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Support Tickets
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        message TEXT,
        category ticket_category DEFAULT 'general',
        status ticket_status DEFAULT 'open',
        priority ticket_priority DEFAULT 'normal',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Ticket Replies
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ticket_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Seller Reviews
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.seller_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        content TEXT,
        is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // OTP Codes
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.otp_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        channel otp_channel NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        is_used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Platform Settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.platform_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        seller_id UUID REFERENCES auth.users(id),
        listing_id UUID REFERENCES public.listings(id),
        order_number TEXT UNIQUE,
        status order_status DEFAULT 'pending',
        total_amount NUMERIC(12,2),
        payment_status payment_status DEFAULT 'unpaid',
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    console.log('   ✅ Tables created\n');

    // Step 5: Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    const tables = [
      'profiles', 'user_roles', 'kyc_verifications', 'wallets', 'transactions',
      'withdrawals', 'user_credits', 'credit_transactions', 'credit_packages',
      'coupons', 'coupon_uses', 'categories', 'listings', 'listing_images',
      'saved_listings', 'listing_reports', 'listing_auctions', 'auction_bids',
      'boost_types', 'listing_boosts', 'banners', 'umkm_profiles', 'umkm_reviews',
      'products', 'product_images', 'conversations', 'messages', 'notifications',
      'support_tickets', 'ticket_replies', 'seller_reviews', 'otp_codes',
      'platform_settings', 'orders'
    ];
    
    for (const table of tables) {
      await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
    }
    console.log('   ✅ RLS enabled\n');

    // Step 6: Create RLS Policies
    console.log('📝 Creating RLS policies...');
    
    // Profiles policies
    await client.query(`CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id)`);
    
    // User roles policies
    await client.query(`CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id)`);
    
    // Listings policies
    await client.query(`CREATE POLICY "Anyone can view active listings" ON public.listings FOR SELECT USING (status = 'active' AND deleted_at IS NULL)`);
    await client.query(`CREATE POLICY "Users can view own listings" ON public.listings FOR SELECT USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users can create listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = user_id)`);
    
    // Categories policies
    await client.query(`CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true)`);
    
    // Notifications policies
    await client.query(`CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id)`);
    
    // Messages policies
    await client.query(`CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id)`);
    
    // User credits policies
    await client.query(`CREATE POLICY "Users can view own credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id)`);
    
    // Wallets policies
    await client.query(`CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id)`);
    
    console.log('   ✅ RLS policies created\n');

    // Step 7: Create indexes
    console.log('🔍 Creating indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_user ON public.listings(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_created ON public.listings(created_at DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_auction_bids_auction ON public.auction_bids(auction_id)`);
    console.log('   ✅ Indexes created\n');

    // Step 8: Create triggers
    console.log('⚡ Creating triggers...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.wallets (user_id) VALUES (NEW.user_id);
        INSERT INTO public.user_credits (user_id) VALUES (NEW.user_id);
        INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'user');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
      CREATE TRIGGER on_profile_created
        AFTER INSERT ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    `);
    console.log('   ✅ Triggers created\n');

    // Step 9: Seed data
    console.log('🌱 Seeding initial data...');
    
    await client.query(`
      INSERT INTO public.credit_packages (name, credits, price, bonus_credits, is_featured, sort_order) VALUES
        ('Starter', 10, 15000, 0, false, 1),
        ('Basic', 50, 65000, 5, false, 2),
        ('Popular', 100, 120000, 15, true, 3),
        ('Pro', 250, 275000, 50, false, 4),
        ('Enterprise', 500, 500000, 150, false, 5)
      ON CONFLICT DO NOTHING
    `);
    
    await client.query(`
      INSERT INTO public.boost_types (type, name, credits_per_day, multiplier) VALUES
        ('highlight', 'Highlight', 5, 1.5),
        ('top_search', 'Top Search', 10, 2),
        ('premium', 'Premium', 20, 3)
      ON CONFLICT DO NOTHING
    `);
    
    await client.query(`
      INSERT INTO public.categories (name, slug, sort_order) VALUES
        ('Elektronik', 'elektronik', 1),
        ('Kendaraan', 'kendaraan', 2),
        ('Properti', 'properti', 3),
        ('Fashion', 'fashion', 4),
        ('Hobi & Koleksi', 'hobi-koleksi', 5),
        ('Rumah Tangga', 'rumah-tangga', 6),
        ('Jasa', 'jasa', 7),
        ('Lainnya', 'lainnya', 99)
      ON CONFLICT DO NOTHING
    `);
    
    await client.query(`
      INSERT INTO public.platform_settings (key, value, description) VALUES
        ('listing_credits', '{"post_listing": 1, "extra_image": 1, "auction_listing": 2}', 'Credit costs'),
        ('boost_credits', '{"highlight": 5, "top_search": 10, "premium": 20}', 'Boost costs'),
        ('platform_fee', '{"auction_percent": 5}', 'Platform fees')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('   ✅ Data seeded\n');

    // Step 10: Enable realtime
    console.log('📡 Enabling realtime...');
    try {
      await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE public.messages`);
      await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations`);
      await client.query(`ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications`);
    } catch (e) {
      // Already added
    }
    console.log('   ✅ Realtime enabled\n');

    // Verify
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`📊 Total tables created: ${result.rows.length}`);
    console.log('📋 Tables:', result.rows.map((r: any) => r.table_name).join(', '));
    console.log('\n🔗 Dashboard: https://supabase.com/dashboard/project/fnicnfehvjuxmemujrhl');

  } catch (error: any) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed.');
  }
}

migrate();
