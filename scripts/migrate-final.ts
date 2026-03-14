/**
 * Complete Migration Script for Supabase
 * Fixed order of operations
 */

import pg from 'pg';

const { Client } = pg;

async function migrate() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SUPABASE DATABASE MIGRATION');
  console.log('  Project: fnicnfehvjuxmemujrhl');
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
    console.log('✅ Connected\n');

    // 1. Extensions
    console.log('📦 Extensions...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "unaccent"');
    console.log('   ✅ Done\n');

    // 2. ENUMs
    console.log('📋 ENUM types...');
    const enums = [
      ['app_role', ['user', 'admin', 'penjual']],
      ['listing_price_type', ['fixed', 'negotiable', 'auction']],
      ['listing_type', ['sale', 'rent', 'service', 'wanted']],
      ['listing_condition', ['new', 'like_new', 'good', 'fair', 'poor']],
      ['listing_status', ['draft', 'pending_review', 'active', 'sold', 'expired', 'rejected', 'deleted']],
      ['auction_status', ['active', 'ended', 'sold', 'cancelled', 'no_winner']],
      ['boost_type', ['highlight', 'top_search', 'premium']],
      ['boost_status', ['active', 'expired', 'cancelled']],
      ['credit_transaction_type', ['purchase', 'usage', 'refund', 'bonus', 'expired', 'topup', 'adjustment']],
      ['order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'failed']],
      ['payment_status', ['unpaid', 'pending', 'paid', 'failed', 'refunded', 'partial']],
      ['payment_method', ['bank_transfer', 'e_wallet', 'credit_card', 'cod', 'credit', 'va']],
      ['kyc_status', ['not_submitted', 'draft', 'pending', 'under_review', 'approved', 'rejected', 'expired']],
      ['document_type', ['ktp', 'npwp', 'siup', 'tdp', 'nib', 'akta', 'skdp', 'other']],
      ['wallet_status', ['active', 'frozen', 'closed', 'suspended']],
      ['transaction_type', ['topup', 'withdrawal', 'payment', 'refund', 'commission', 'bonus', 'transfer_in', 'transfer_out', 'adjustment']],
      ['withdrawal_status', ['pending', 'processing', 'approved', 'rejected', 'paid', 'failed', 'cancelled']],
      ['banner_position', ['hero', 'sidebar', 'inline', 'footer', 'category_top', 'search_top']],
      ['banner_status', ['pending', 'active', 'paused', 'expired', 'rejected']],
      ['banner_pricing_model', ['cpc', 'cpm', 'fixed']],
      ['report_reason', ['spam', 'fraud', 'inappropriate', 'wrong_category', 'duplicate', 'counterfeit', 'sold_elsewhere', 'other']],
      ['report_status', ['pending', 'reviewed', 'action_taken', 'dismissed']],
      ['umkm_status', ['pending', 'active', 'suspended', 'closed', 'rejected']],
      ['business_scale', ['micro', 'small', 'medium', 'large']],
      ['ticket_status', ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']],
      ['ticket_priority', ['low', 'normal', 'high', 'urgent']],
      ['ticket_category', ['general', 'account', 'payment', 'listing', 'order', 'technical', 'report', 'suggestion']],
      ['notification_type', ['info', 'success', 'warning', 'error', 'order', 'payment', 'message', 'listing', 'promotion', 'system']],
      ['notification_channel', ['in_app', 'email', 'sms', 'whatsapp', 'push']],
      ['otp_channel', ['sms', 'whatsapp', 'email']],
      ['contact_preference', ['phone', 'whatsapp', 'email', 'in_app', 'all']],
      ['promo_type', ['regular', 'flash_sale', 'discount', 'bundle', 'free_shipping', 'cashback']],
      ['subscription_status', ['active', 'expired', 'cancelled', 'pending', 'grace_period']]
    ];
    
    for (const [name, values] of enums) {
      const vals = (values as string[]).map(v => `'${v}'`).join(',');
      await client.query(`DROP TYPE IF EXISTS public.${name} CASCADE`);
      await client.query(`CREATE TYPE public.${name} AS ENUM (${vals})`);
    }
    console.log('   ✅ Done\n');

    // 3. Update timestamp function
    console.log('⚙️  Functions...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = now(); RETURN NEW; END;
      $$ LANGUAGE plpgsql
    `);
    console.log('   ✅ Done\n');

    // 4. Tables in order
    console.log('📊 Tables...');
    
    const tables = `
      -- Regions
      CREATE TABLE IF NOT EXISTS public.provinces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
        latitude DOUBLE PRECISION, longitude DOUBLE PRECISION,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS public.regencies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        province_id UUID REFERENCES public.provinces(id),
        code TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS public.districts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        regency_id UUID REFERENCES public.regencies(id),
        code TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS public.villages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        district_id UUID REFERENCES public.districts(id),
        code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, postal_code TEXT,
        is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Profiles
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT, name TEXT, phone_number TEXT, address TEXT, avatar_url TEXT,
        primary_role TEXT DEFAULT 'user', is_active BOOLEAN DEFAULT true,
        total_listings INTEGER DEFAULT 0, average_rating NUMERIC(3,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- User Roles
      CREATE TABLE IF NOT EXISTS public.user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        role app_role NOT NULL DEFAULT 'user',
        assigned_by UUID, assigned_at TIMESTAMPTZ DEFAULT now(),
        is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(user_id, role)
      );
      
      -- KYC
      CREATE TABLE IF NOT EXISTS public.kyc_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
        ktp_number TEXT, ktp_image_url TEXT, selfie_image_url TEXT,
        status kyc_status DEFAULT 'not_submitted',
        rejection_reason TEXT, reviewed_by UUID, reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Wallet
      CREATE TABLE IF NOT EXISTS public.wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
        balance NUMERIC(15,2) DEFAULT 0, currency_code CHAR(3) DEFAULT 'IDR',
        status wallet_status DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Transactions
      CREATE TABLE IF NOT EXISTS public.transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        wallet_id UUID REFERENCES public.wallets(id),
        type transaction_type NOT NULL, amount NUMERIC(15,2) NOT NULL,
        description TEXT, reference_type TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Withdrawals
      CREATE TABLE IF NOT EXISTS public.withdrawals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        wallet_id UUID REFERENCES public.wallets(id),
        amount NUMERIC(15,2) NOT NULL,
        bank_name TEXT, account_number TEXT, account_holder TEXT,
        status withdrawal_status DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- User Credits
      CREATE TABLE IF NOT EXISTS public.user_credits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
        balance INTEGER DEFAULT 0,
        lifetime_purchased INTEGER DEFAULT 0, lifetime_used INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Credit Transactions
      CREATE TABLE IF NOT EXISTS public.credit_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type credit_transaction_type NOT NULL,
        amount INTEGER NOT NULL, balance_after INTEGER NOT NULL,
        description TEXT, created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Credit Packages
      CREATE TABLE IF NOT EXISTS public.credit_packages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL, credits INTEGER NOT NULL, price NUMERIC NOT NULL,
        bonus_credits INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false, sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Credit Topup Requests
      CREATE TABLE IF NOT EXISTS public.credit_topup_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        package_id UUID REFERENCES public.credit_packages(id),
        amount NUMERIC NOT NULL, credits_amount INTEGER NOT NULL,
        proof_image_url TEXT, status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Coupons
      CREATE TABLE IF NOT EXISTS public.coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL, credits_amount INTEGER DEFAULT 0,
        max_uses INTEGER DEFAULT 1, used_count INTEGER DEFAULT 0,
        expires_at TIMESTAMPTZ, is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Coupon Uses
      CREATE TABLE IF NOT EXISTS public.coupon_uses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        credits_given INTEGER NOT NULL, used_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(coupon_id, user_id)
      );
      
      -- Categories
      CREATE TABLE IF NOT EXISTS public.categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
        parent_id UUID REFERENCES public.categories(id),
        icon_url TEXT, description TEXT,
        is_active BOOLEAN DEFAULT true, sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Listings
      CREATE TABLE IF NOT EXISTS public.listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        category_id UUID REFERENCES public.categories(id),
        title TEXT NOT NULL, slug TEXT UNIQUE, description TEXT,
        price NUMERIC DEFAULT 0, price_type listing_price_type DEFAULT 'fixed',
        listing_type listing_type DEFAULT 'sale',
        condition listing_condition DEFAULT 'good',
        status listing_status DEFAULT 'draft',
        image_url TEXT, location_lat DOUBLE PRECISION, location_lng DOUBLE PRECISION,
        province_id UUID REFERENCES public.provinces(id),
        regency_id UUID REFERENCES public.regencies(id),
        city TEXT, address TEXT, view_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false, featured_until TIMESTAMPTZ,
        expires_at TIMESTAMPTZ, published_at TIMESTAMPTZ,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Listing Images
      CREATE TABLE IF NOT EXISTS public.listing_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Saved Listings
      CREATE TABLE IF NOT EXISTS public.saved_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(), UNIQUE(user_id, listing_id)
      );
      
      -- Listing Reports
      CREATE TABLE IF NOT EXISTS public.listing_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
        reporter_id UUID REFERENCES auth.users(id),
        reason report_reason NOT NULL, description TEXT,
        status report_status DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Listing Auctions
      CREATE TABLE IF NOT EXISTS public.listing_auctions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID UNIQUE REFERENCES public.listings(id) ON DELETE CASCADE,
        starting_price NUMERIC NOT NULL, current_price NUMERIC NOT NULL,
        min_increment NUMERIC DEFAULT 10000, buy_now_price NUMERIC,
        ends_at TIMESTAMPTZ NOT NULL, winner_id UUID REFERENCES auth.users(id),
        total_bids INTEGER DEFAULT 0, status auction_status DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Auction Bids
      CREATE TABLE IF NOT EXISTS public.auction_bids (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        auction_id UUID REFERENCES public.listing_auctions(id) ON DELETE CASCADE,
        bidder_id UUID REFERENCES auth.users(id),
        amount NUMERIC NOT NULL, is_winning BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Boost Types
      CREATE TABLE IF NOT EXISTS public.boost_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type boost_type UNIQUE NOT NULL, name TEXT NOT NULL,
        credits_per_day INTEGER NOT NULL, multiplier NUMERIC DEFAULT 1,
        is_active BOOLEAN DEFAULT true
      );
      
      -- Listing Boosts
      CREATE TABLE IF NOT EXISTS public.listing_boosts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id),
        boost_type boost_type NOT NULL, credits_used INTEGER NOT NULL,
        starts_at TIMESTAMPTZ DEFAULT now(), ends_at TIMESTAMPTZ NOT NULL,
        status boost_status DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Banners
      CREATE TABLE IF NOT EXISTS public.banners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        title TEXT NOT NULL, image_url TEXT NOT NULL, target_url TEXT NOT NULL,
        position banner_position DEFAULT 'inline',
        status banner_status DEFAULT 'pending',
        pricing_model banner_pricing_model DEFAULT 'cpc',
        budget_total NUMERIC DEFAULT 0, budget_spent NUMERIC DEFAULT 0,
        impressions INTEGER DEFAULT 0, clicks INTEGER DEFAULT 0,
        starts_at TIMESTAMPTZ DEFAULT now(), ends_at TIMESTAMPTZ,
        deleted_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- UMKM Profiles
      CREATE TABLE IF NOT EXISTS public.umkm_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID UNIQUE REFERENCES auth.users(id),
        umkm_name TEXT NOT NULL, brand_name TEXT, slug TEXT UNIQUE,
        description TEXT, category_id UUID REFERENCES public.categories(id),
        business_scale business_scale DEFAULT 'micro',
        phone TEXT, whatsapp TEXT, email TEXT, website TEXT,
        province_id UUID REFERENCES public.provinces(id),
        regency_id UUID REFERENCES public.regencies(id),
        address TEXT, city TEXT, logo_url TEXT, banner_url TEXT,
        is_verified BOOLEAN DEFAULT false, status umkm_status DEFAULT 'pending',
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- UMKM Reviews
      CREATE TABLE IF NOT EXISTS public.umkm_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        umkm_id UUID REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
        reviewer_id UUID REFERENCES auth.users(id),
        rating INTEGER NOT NULL, content TEXT, is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Products
      CREATE TABLE IF NOT EXISTS public.products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        umkm_id UUID REFERENCES public.umkm_profiles(id) ON DELETE CASCADE,
        category_id UUID REFERENCES public.categories(id),
        name TEXT NOT NULL, slug TEXT, description TEXT,
        price NUMERIC(12,2), stock INTEGER DEFAULT 0, status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Product Images
      CREATE TABLE IF NOT EXISTS public.product_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL, is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Conversations
      CREATE TABLE IF NOT EXISTS public.conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
        buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        last_message_at TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(listing_id, buyer_id, seller_id)
      );
      
      -- Messages
      CREATE TABLE IF NOT EXISTS public.messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        content TEXT NOT NULL, is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Notifications
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL, message TEXT,
        type notification_type DEFAULT 'info',
        is_read BOOLEAN DEFAULT false, data JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Support Tickets
      CREATE TABLE IF NOT EXISTS public.support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL, message TEXT,
        category ticket_category DEFAULT 'general',
        status ticket_status DEFAULT 'open',
        priority ticket_priority DEFAULT 'normal',
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Ticket Replies
      CREATE TABLE IF NOT EXISTS public.ticket_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        message TEXT NOT NULL, is_internal BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Seller Reviews
      CREATE TABLE IF NOT EXISTS public.seller_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL, content TEXT, is_anonymous BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- OTP Codes
      CREATE TABLE IF NOT EXISTS public.otp_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        channel otp_channel NOT NULL, code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL, is_used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Platform Settings
      CREATE TABLE IF NOT EXISTS public.platform_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL, value JSONB NOT NULL, description TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Orders
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        seller_id UUID REFERENCES auth.users(id),
        listing_id UUID REFERENCES public.listings(id),
        order_number TEXT UNIQUE, status order_status DEFAULT 'pending',
        total_amount NUMERIC(12,2), payment_status payment_status DEFAULT 'unpaid',
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Admin Logs
      CREATE TABLE IF NOT EXISTS public.admin_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID NOT NULL, action TEXT NOT NULL,
        target_type TEXT, target_id UUID, details JSONB,
        ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Audit Logs
      CREATE TABLE IF NOT EXISTS public.audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID, action TEXT NOT NULL,
        entity_type TEXT, entity_id UUID, details JSONB,
        ip_address TEXT, created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Testimonials
      CREATE TABLE IF NOT EXISTS public.testimonials (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL, role TEXT, avatar_url TEXT,
        content TEXT NOT NULL, rating INTEGER DEFAULT 5,
        is_featured BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Subscription Plans
      CREATE TABLE IF NOT EXISTS public.subscription_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL,
        price NUMERIC DEFAULT 0, duration_days INTEGER DEFAULT 30,
        features JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true, is_featured BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Permissions
      CREATE TABLE IF NOT EXISTS public.permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
        description TEXT, module TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now()
      );
      
      -- Role Permissions
      CREATE TABLE IF NOT EXISTS public.role_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role TEXT NOT NULL,
        permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
        can_access BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(role, permission_id)
      );
    `;
    
    // Split and execute each statement
    const statements = tables.split(';').filter(s => s.trim().length > 10);
    for (const stmt of statements) {
      try {
        await client.query(stmt + ';');
      } catch (e: any) {
        if (!e.message.includes('already exists')) {
          console.log('   ⚠️ ', e.message.substring(0, 80));
        }
      }
    }
    console.log('   ✅ Done\n');

    // 5. has_role function (after user_roles exists)
    console.log('⚙️  Creating has_role function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
      RETURNS BOOLEAN AS $$
        SELECT EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = _user_id AND role = _role AND is_active = true
        );
      $$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
    `);
    console.log('   ✅ Done\n');

    // 6. RLS
    console.log('🔒 Enabling RLS...');
    const rlsTables = [
      'profiles', 'user_roles', 'kyc_verifications', 'wallets', 'transactions',
      'withdrawals', 'user_credits', 'credit_transactions', 'credit_packages',
      'credit_topup_requests', 'coupons', 'coupon_uses', 'categories',
      'listings', 'listing_images', 'saved_listings', 'listing_reports',
      'listing_auctions', 'auction_bids', 'boost_types', 'listing_boosts',
      'banners', 'umkm_profiles', 'umkm_reviews', 'products', 'product_images',
      'conversations', 'messages', 'notifications', 'support_tickets',
      'ticket_replies', 'seller_reviews', 'otp_codes', 'platform_settings',
      'orders', 'admin_logs', 'audit_logs', 'testimonials',
      'subscription_plans', 'permissions', 'role_permissions',
      'provinces', 'regencies', 'districts', 'villages'
    ];
    for (const t of rlsTables) {
      await client.query(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY`);
    }
    console.log('   ✅ Done\n');

    // 7. Basic RLS Policies
    console.log('📝 Creating RLS policies...');
    
    await client.query(`CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Anyone view categories" ON public.categories FOR SELECT USING (true)`);
    await client.query(`CREATE POLICY "View active listings" ON public.listings FOR SELECT USING (status = 'active' AND deleted_at IS NULL)`);
    await client.query(`CREATE POLICY "Users view own listings" ON public.listings FOR SELECT USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users create listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users update own listings" ON public.listings FOR UPDATE USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users manage notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users view own credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id)`);
    await client.query(`CREATE POLICY "View active packages" ON public.credit_packages FOR SELECT USING (is_active = true)`);
    await client.query(`CREATE POLICY "View active boost types" ON public.boost_types FOR SELECT USING (is_active = true)`);
    
    console.log('   ✅ Done\n');

    // 8. Indexes
    console.log('🔍 Creating indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_user ON public.listings(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id)`);
    console.log('   ✅ Done\n');

    // 9. Triggers
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
      $$ LANGUAGE plpgsql SECURITY DEFINER
    `);
    await client.query(`
      DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
      CREATE TRIGGER on_profile_created
        AFTER INSERT ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
    `);
    console.log('   ✅ Done\n');

    // 10. Seed Data
    console.log('🌱 Seeding data...');
    
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
    
    console.log('   ✅ Done\n');

    // Verify
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`📊 Tables created: ${result.rows.length}`);
    console.log('📋 Tables:', result.rows.map((r: any) => r.table_name).join(', '));
    console.log('\n🔗 Dashboard: https://supabase.com/dashboard/project/fnicnfehvjuxmemujrhl');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Done.');
  }
}

migrate();
