-- ============================================================
-- COMPLETE DATABASE SCHEMA - Marketplace Application
-- PostgreSQL 15+ | Supabase
-- ============================================================
-- Column names use camelCase to match TypeScript types
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- ENUM TYPES
-- ============================================================
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.listing_price_type CASCADE;
DROP TYPE IF EXISTS public.listing_type CASCADE;
DROP TYPE IF EXISTS public.listing_condition CASCADE;
DROP TYPE IF EXISTS public.listing_status CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.credit_transaction_type CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.withdrawal_status CASCADE;
DROP TYPE IF EXISTS public.kyc_status CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.ticket_status CASCADE;
DROP TYPE IF EXISTS public.ticket_priority CASCADE;
DROP TYPE IF EXISTS public.ticket_category CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;
DROP TYPE IF EXISTS public.promo_type CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.listing_price_type CASCADE;
DROP TYPE IF EXISTS public.listing_type CASCADE;
DROP TYPE IF EXISTS public.listing_condition CASCADE;
DROP TYPE IF EXISTS public.listing_status CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.credit_transaction_type CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.withdrawal_status CASCADE;
DROP TYPE IF EXISTS public.kyc_status CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.ticket_status CASCADE;
DROP TYPE IF EXISTS public.ticket_priority CASCADE;
DROP TYPE IF EXISTS public.ticket_category CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;
DROP TYPE IF EXISTS public.promo_type CASCADE;

CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'penjual');
CREATE TYPE public.listing_price_type AS ENUM ('fixed', 'negotiable', 'auction');
CREATE TYPE public.listing_type AS ENUM ('sale', 'rent', 'service', 'wanted');
CREATE TYPE public.listing_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
CREATE TYPE public.listing_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'expired', 'rejected', 'deleted');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'failed');
CREATE TYPE public.credit_transaction_type AS ENUM ('purchase', 'usage', 'refund', 'bonus', 'expired', 'topup', 'adjustment');
CREATE TYPE public.transaction_type AS ENUM ('topup', 'withdrawal', 'payment', 'refund', 'commission', 'bonus', 'transfer_in', 'transfer_out', 'adjustment');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'approved', 'rejected', 'paid', 'failed', 'cancelled');
CREATE TYPE public.kyc_status AS ENUM ('not_submitted', 'draft', 'pending', 'under_review', 'approved', 'rejected', 'expired');
CREATE TYPE public.document_type AS ENUM ('ktp', 'npwp', 'siup', 'tdp', 'nib', 'akta', 'skdp', 'other');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE public.ticket_category AS ENUM ('general', 'account', 'payment', 'listing', 'order', 'technical', 'report', 'suggestion');
CREATE TYPE public.notification_type AS ENUM ('info', 'success', 'warning', 'error', 'order', 'payment', 'message', 'listing', 'promotion', 'system');
CREATE TYPE public.promo_type AS ENUM ('regular', 'flash_sale', 'discount', 'bundle', 'free_shipping', 'cashback');

-- ============================================================
-- UTILITY FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updatedAt = now(); RETURN NEW; END;$$;

-- ============================================================
-- REGIONS (Indonesia)
-- ============================================================
CREATE TABLE public.provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.regencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provinceId UUID NOT NULL REFERENCES public.provinces(id),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'kabupaten',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regencyId UUID NOT NULL REFERENCES public.regencies(id),
  name TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.villages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  districtId UUID NOT NULL REFERENCES public.districts(id),
  name TEXT NOT NULL,
  type TEXT,
  postalCode TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- USER MANAGEMENT
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  address TEXT,
  avatarUrl TEXT,
  bio TEXT,
  city TEXT,
  province TEXT,
  provinceId UUID REFERENCES public.provinces(id),
  regencyId UUID REFERENCES public.regencies(id),
  districtId UUID,
  villageId UUID,
  postalCode TEXT,
  website TEXT,
  isVerified BOOLEAN DEFAULT false,
  isKycVerified BOOLEAN DEFAULT false,
  primaryRole TEXT DEFAULT 'user',
  isActive BOOLEAN DEFAULT true,
  totalListings INTEGER DEFAULT 0,
  activeListings INTEGER DEFAULT 0,
  soldCount INTEGER DEFAULT 0,
  totalSales NUMERIC DEFAULT 0,
  averageRating NUMERIC(3,2) DEFAULT 0,
  totalReviews INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.userRoles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  assignedBy UUID REFERENCES auth.users(id),
  assignedAt TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT now(),
  UNIQUE(userId, role)
);

CREATE TABLE public.kycVerifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ktpNumber TEXT,
  npwpNumber TEXT,
  status kyc_status DEFAULT 'not_submitted',
  submittedAt TIMESTAMPTZ,
  reviewedBy UUID REFERENCES auth.users(id),
  reviewedAt TIMESTAMPTZ,
  rejectionReason TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.kycDocuments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kycVerificationId UUID NOT NULL REFERENCES public.kycVerifications(id) ON DELETE CASCADE,
  documentType document_type NOT NULL,
  documentUrl TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- WALLET & TRANSACTIONS
-- ============================================================
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(15,2) DEFAULT 0,
  currencyCode CHAR(3) DEFAULT 'IDR',
  status TEXT DEFAULT 'active',
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_wallet_balance CHECK (balance >= 0)
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  walletId UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  balanceBefore NUMERIC(15,2),
  balanceAfter NUMERIC(15,2),
  description TEXT,
  referenceType TEXT,
  referenceId UUID,
  isReversed BOOLEAN DEFAULT false,
  createdAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_transaction_amount CHECK (amount > 0)
);

CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  walletId UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  bankName TEXT NOT NULL,
  bankAccount TEXT NOT NULL,
  bankAccountName TEXT NOT NULL,
  status withdrawal_status DEFAULT 'pending',
  processedBy UUID REFERENCES auth.users(id),
  processedAt TIMESTAMPTZ,
  notes TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_withdrawal_amount CHECK (amount > 0)
);

-- ============================================================
-- CREDIT SYSTEM
-- ============================================================
CREATE TABLE public.userCredits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  totalPurchased INTEGER DEFAULT 0,
  totalUsed INTEGER DEFAULT 0,
  totalBonus INTEGER DEFAULT 0,
  totalExpired INTEGER DEFAULT 0,
  lastTransactionAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_credits_balance CHECK (balance >= 0)
);

CREATE TABLE public.creditTransactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type credit_transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  balanceAfter INTEGER NOT NULL,
  referenceType TEXT,
  referenceId UUID,
  description TEXT,
  paymentId UUID,
  createdAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_credit_amount CHECK (amount > 0)
);

CREATE TABLE public.creditPackages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  bonusCredits INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  isFeatured BOOLEAN DEFAULT false,
  sortOrder INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_credit_package CHECK (credits > 0 AND price > 0 AND bonusCredits >= 0)
);

CREATE TABLE public.creditTopupRequests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id),
  packageId UUID REFERENCES public.creditPackages(id),
  amount NUMERIC NOT NULL,
  creditsAmount INTEGER NOT NULL,
  bonusCredits INTEGER DEFAULT 0,
  paymentProof TEXT,
  status TEXT DEFAULT 'pending',
  reviewedBy UUID REFERENCES auth.users(id),
  reviewedAt TIMESTAMPTZ,
  notes TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_topup_request CHECK (amount > 0 AND creditsAmount > 0)
);

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  creditsAmount INTEGER DEFAULT 0,
  maxUses INTEGER DEFAULT 1,
  usedCount INTEGER DEFAULT 0,
  minPurchase NUMERIC,
  expiresAt TIMESTAMPTZ,
  isActive BOOLEAN DEFAULT true,
  createdById UUID REFERENCES auth.users(id),
  createdAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_coupon CHECK (creditsAmount >= 0 AND maxUses > 0 AND usedCount >= 0)
);

CREATE TABLE public.couponUses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couponId UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usedAt TIMESTAMPTZ DEFAULT now(),
  UNIQUE(couponId, userId)
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  iconUrl TEXT,
  imageBannerUrl TEXT,
  parentId UUID REFERENCES public.categories(id),
  sortOrder INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  isFeatured BOOLEAN DEFAULT false,
  listingCount INTEGER DEFAULT 0,
  umkmCount INTEGER DEFAULT 0,
  keywords TEXT,
  metaTitle TEXT,
  metaDescription TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LISTINGS
-- ============================================================
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoryId UUID NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price NUMERIC DEFAULT 0,
  priceType listing_price_type DEFAULT 'fixed',
  listingType listing_type DEFAULT 'sale',
  condition listing_condition DEFAULT 'good',
  status listing_status DEFAULT 'draft',
  city TEXT,
  province TEXT,
  provinceId UUID REFERENCES public.provinces(id),
  regencyId UUID REFERENCES public.regencies(id),
  districtId UUID,
  villageId UUID,
  locationLat DOUBLE PRECISION,
  locationLng DOUBLE PRECISION,
  address TEXT,
  viewCount INTEGER DEFAULT 0,
  clickCount INTEGER DEFAULT 0,
  shareCount INTEGER DEFAULT 0,
  favoriteCount INTEGER DEFAULT 0,
  inquiryCount INTEGER DEFAULT 0,
  isFeatured BOOLEAN DEFAULT false,
  featuredUntil TIMESTAMPTZ,
  keywords TEXT,
  attributes TEXT,
  publishedAt TIMESTAMPTZ,
  expiresAt TIMESTAMPTZ,
  soldTo UUID REFERENCES auth.users(id),
  soldAt TIMESTAMPTZ,
  approvedBy UUID REFERENCES auth.users(id),
  approvedAt TIMESTAMPTZ,
  rejectedReason TEXT,
  deletedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_listings_price CHECK (price >= 0),
  CONSTRAINT chk_listings_counts CHECK (viewCount >= 0 AND clickCount >= 0 AND shareCount >= 0 AND favoriteCount >= 0 AND inquiryCount >= 0)
);

CREATE TABLE public.listingImages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listingId UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  imageUrl TEXT NOT NULL,
  isPrimary BOOLEAN DEFAULT false,
  sortOrder INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.listingAuctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listingId UUID UNIQUE NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  startingPrice NUMERIC NOT NULL,
  currentPrice NUMERIC NOT NULL,
  buyNowPrice NUMERIC,
  minIncrement NUMERIC DEFAULT 10000,
  reservePrice NUMERIC,
  startsAt TIMESTAMPTZ,
  endsAt TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active',
  winnerId UUID REFERENCES auth.users(id),
  totalBids INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.auctionBids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auctionId UUID NOT NULL REFERENCES public.listingAuctions(id) ON DELETE CASCADE,
  bidderId UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  isWinning BOOLEAN DEFAULT false,
  isAutoBid BOOLEAN DEFAULT false,
  maxAutoAmount NUMERIC,
  createdAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_bid_amount CHECK (amount > 0)
);

CREATE TABLE public.listingBoosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listingId UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  boostType TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  creditsCost INTEGER NOT NULL,
  startsAt TIMESTAMPTZ,
  endsAt TIMESTAMPTZ NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.savedListings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listingId UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ DEFAULT now(),
  UNIQUE(userId, listingId)
);

CREATE TABLE public.listingReports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listingId UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reporterId UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  reviewedBy UUID REFERENCES auth.users(id),
  reviewedAt TIMESTAMPTZ,
  action TEXT,
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listingId UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyerId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sellerId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status order_status DEFAULT 'pending',
  totalAmount NUMERIC NOT NULL,
  notes TEXT,
  cancelledAt TIMESTAMPTZ,
  cancelledBy UUID,
  cancelReason TEXT,
  completedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_order_amount CHECK (totalAmount >= 0)
);

CREATE TABLE public.sellerReviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sellerId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewerId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5)
);

-- ============================================================
-- UMKM (Business Profiles)
-- ============================================================
CREATE TABLE public.umkmProfiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ownerId UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  umkmName TEXT NOT NULL,
  brandName TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  tagline TEXT,
  logoUrl TEXT,
  bannerUrl TEXT,
  category TEXT,
  subcategory TEXT,
  categoryId UUID REFERENCES public.categories(id),
  businessScale TEXT,
  businessType TEXT,
  npwp TEXT,
  nib TEXT,
  provinceId UUID REFERENCES public.provinces(id),
  regencyId UUID REFERENCES public.regencies(id),
  address TEXT,
  city TEXT,
  postalCode TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  whatsapp TEXT,
  isVerified BOOLEAN DEFAULT false,
  verifiedBy UUID REFERENCES auth.users(id),
  verifiedAt TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  viewCount INTEGER DEFAULT 0,
  totalProducts INTEGER DEFAULT 0,
  totalOrders INTEGER DEFAULT 0,
  totalRevenue NUMERIC DEFAULT 0,
  averageRating NUMERIC(3,2) DEFAULT 0,
  totalReviews INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  umkmId UUID NOT NULL REFERENCES public.umkmProfiles(id) ON DELETE CASCADE,
  categoryId UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  price NUMERIC,
  stock INTEGER DEFAULT 0,
  sku TEXT,
  weight NUMERIC,
  length NUMERIC,
  width NUMERIC,
  height NUMERIC,
  status TEXT DEFAULT 'active',
  primaryImageUrl TEXT,
  viewCount INTEGER DEFAULT 0,
  totalSold INTEGER DEFAULT 0,
  averageRating NUMERIC(3,2) DEFAULT 0,
  totalReviews INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.productImages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productId UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  imageUrl TEXT NOT NULL,
  isPrimary BOOLEAN DEFAULT false,
  sortOrder INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.productReviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productId UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_product_review_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE TABLE public.umkmReviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  umkmId UUID NOT NULL REFERENCES public.umkmProfiles(id) ON DELETE CASCADE,
  reviewerId UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  createdAt TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_umkm_review_rating CHECK (rating >= 1 AND rating <= 5)
);

-- ============================================================
-- MESSAGING
-- ============================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listingId UUID REFERENCES public.listings(id),
  buyerId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sellerId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lastMessage TEXT,
  lastMessageAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now(),
  UNIQUE(listingId, buyerId, sellerId)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversationId UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  senderId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  isRead BOOLEAN DEFAULT false,
  readAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data TEXT,
  isRead BOOLEAN DEFAULT false,
  readAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE public.supportTickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category ticket_category,
  priority ticket_priority DEFAULT 'normal',
  status ticket_status DEFAULT 'open',
  assignedTo UUID REFERENCES auth.users(id),
  resolvedBy UUID REFERENCES auth.users(id),
  resolvedAt TIMESTAMPTZ,
  lastReplyAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ticketReplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticketId UUID NOT NULL REFERENCES public.supportTickets(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  isStaff BOOLEAN DEFAULT false,
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- BANNER ADS
-- ============================================================
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  imageUrl TEXT NOT NULL,
  targetUrl TEXT NOT NULL,
  position TEXT NOT NULL,
  pricingModel TEXT DEFAULT 'cpc',
  costPerClick NUMERIC,
  costPerMille NUMERIC,
  budgetTotal NUMERIC DEFAULT 0,
  budgetSpent NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  startsAt TIMESTAMPTZ,
  endsAt TIMESTAMPTZ,
  approvedBy UUID REFERENCES auth.users(id),
  approvedAt TIMESTAMPTZ,
  deletedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.bannerEvents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bannerId UUID NOT NULL REFERENCES public.banners(id) ON DELETE CASCADE,
  eventType TEXT NOT NULL,
  userId UUID REFERENCES auth.users(id),
  costAmount NUMERIC,
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SPONSORS
-- ============================================================
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logoUrl TEXT NOT NULL,
  website TEXT,
  category TEXT,
  isActive BOOLEAN DEFAULT true,
  sortOrder INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.carouselConfigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scrollSpeed INTEGER DEFAULT 3000,
  pauseOnHover BOOLEAN DEFAULT true,
  updatedAt TIMESTAMPTZ DEFAULT now(),
  updatedBy UUID REFERENCES auth.users(id)
);

-- ============================================================
-- CREDIT SCORING
-- ============================================================
CREATE TABLE public.creditScores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  totalScore INTEGER DEFAULT 0,
  businessDurationScore INTEGER DEFAULT 0,
  revenueScore INTEGER DEFAULT 0,
  transactionScore INTEGER DEFAULT 0,
  ratingScore INTEGER DEFAULT 0,
  kycScore INTEGER DEFAULT 0,
  assetScore INTEGER DEFAULT 0,
  paymentHistoryScore INTEGER DEFAULT 0,
  eligibilityStatus TEXT DEFAULT 'pending',
  recommendedLoanAmount NUMERIC DEFAULT 0,
  riskLevel TEXT,
  lastCalculatedAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.aiCreditScores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  totalScore INTEGER DEFAULT 0,
  confidence NUMERIC DEFAULT 0,
  slikScore INTEGER DEFAULT 0,
  socialMediaScore INTEGER DEFAULT 0,
  platformScore INTEGER DEFAULT 0,
  behavioralScore INTEGER DEFAULT 0,
  verificationScore INTEGER DEFAULT 0,
  riskLevel TEXT,
  riskFactors JSONB,
  recommendations JSONB,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.socialMediaConnections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platformId TEXT NOT NULL,
  accessToken TEXT NOT NULL,
  refreshToken TEXT,
  expiresAt TIMESTAMPTZ,
  isActive BOOLEAN DEFAULT true,
  lastSynced TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.slikOjkConsents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nik TEXT NOT NULL,
  consentGiven BOOLEAN DEFAULT false,
  consentDate TIMESTAMPTZ,
  lastChecked TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now(),
  updatedAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SYSTEM
-- ============================================================
CREATE TABLE public.platformSettings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updatedAt TIMESTAMPTZ DEFAULT now(),
  updatedBy UUID REFERENCES auth.users(id)
);

CREATE TABLE public.adminLogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adminId UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  targetType TEXT,
  targetId UUID,
  details TEXT,
  ipAddress TEXT,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.auditLogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entityType TEXT,
  entityId UUID,
  details TEXT,
  ipAddress TEXT,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatarUrl TEXT,
  company TEXT,
  isActive BOOLEAN DEFAULT true,
  sortOrder INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.boostTypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  creditsPerDay INTEGER NOT NULL,
  multiplier NUMERIC DEFAULT 1,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.activityLogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES auth.users(id),
  userEmail TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  metadata JSONB,
  createdAt TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_profiles_userId ON public.profiles(userId);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_userRoles_userId ON public.userRoles(userId);
CREATE INDEX idx_userRoles_role ON public.userRoles(role);
CREATE INDEX idx_listings_userId ON public.listings(userId);
CREATE INDEX idx_listings_categoryId ON public.listings(categoryId);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_createdAt ON public.listings(createdAt DESC);
CREATE INDEX idx_listings_slug ON public.listings(slug);
CREATE INDEX idx_listingImages_listingId ON public.listingImages(listingId);
CREATE INDEX idx_listingAuctions_listingId ON public.listingAuctions(listingId);
CREATE INDEX idx_auctionBids_auctionId ON public.auctionBids(auctionId);
CREATE INDEX idx_auctionBids_bidderId ON public.auctionBids(bidderId);
CREATE INDEX idx_orders_listingId ON public.orders(listingId);
CREATE INDEX idx_orders_buyerId ON public.orders(buyerId);
CREATE INDEX idx_orders_sellerId ON public.orders(sellerId);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_createdAt ON public.orders(createdAt DESC);
CREATE INDEX idx_conversations_listingId ON public.conversations(listingId);
CREATE INDEX idx_conversations_buyerId ON public.conversations(buyerId);
CREATE INDEX idx_conversations_sellerId ON public.conversations(sellerId);
CREATE INDEX idx_messages_conversationId ON public.messages(conversationId);
CREATE INDEX idx_messages_senderId ON public.messages(senderId);
CREATE INDEX idx_messages_createdAt ON public.messages(createdAt DESC);
CREATE INDEX idx_notifications_userId ON public.notifications(userId);
CREATE INDEX idx_notifications_isRead ON public.notifications(isRead);
CREATE INDEX idx_notifications_createdAt ON public.notifications(createdAt DESC);
CREATE INDEX idx_supportTickets_userId ON public.supportTickets(userId);
CREATE INDEX idx_supportTickets_status ON public.supportTickets(status);
CREATE INDEX idx_supportTickets_createdAt ON public.supportTickets(createdAt DESC);
CREATE INDEX idx_ticketReplies_ticketId ON public.ticketReplies(ticketId);
CREATE INDEX idx_creditTransactions_userId ON public.creditTransactions(userId);
CREATE INDEX idx_creditTransactions_createdAt ON public.creditTransactions(createdAt DESC);
CREATE INDEX idx_transactions_userId ON public.transactions(userId);
CREATE INDEX idx_transactions_walletId ON public.transactions(walletId);
CREATE INDEX idx_transactions_createdAt ON public.transactions(createdAt DESC);
CREATE INDEX idx_activityLogs_userId ON public.activityLogs(userId);
CREATE INDEX idx_activityLogs_createdAt ON public.activityLogs(createdAt DESC);
CREATE INDEX idx_umkmProfiles_ownerId ON public.umkmProfiles(ownerId);
CREATE INDEX idx_products_umkmId ON public.products(umkmId);
CREATE INDEX idx_banners_userId ON public.banners(userId);
CREATE INDEX idx_banners_status ON public.banners(status);
CREATE INDEX idx_creditScores_userId ON public.creditScores(userId);
CREATE INDEX idx_aiCreditScores_userId ON public.aiCreditScores(userId);

-- ============================================================
-- TRIGGERS (auto-update updatedAt)
-- ============================================================
CREATE TRIGGER update_profiles_updatedAt BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_userRoles_updatedAt BEFORE UPDATE ON public.userRoles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kycVerifications_updatedAt BEFORE UPDATE ON public.kycVerifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updatedAt BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawals_updatedAt BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_userCredits_updatedAt BEFORE UPDATE ON public.userCredits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creditPackages_updatedAt BEFORE UPDATE ON public.creditPackages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creditTopupRequests_updatedAt BEFORE UPDATE ON public.creditTopupRequests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updatedAt BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updatedAt BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listingAuctions_updatedAt BEFORE UPDATE ON public.listingAuctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updatedAt BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sellerReviews_updatedAt BEFORE UPDATE ON public.sellerReviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_umkmProfiles_updatedAt BEFORE UPDATE ON public.umkmProfiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updatedAt BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updatedAt BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supportTickets_updatedAt BEFORE UPDATE ON public.supportTickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updatedAt BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsors_updatedAt BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creditScores_updatedAt BEFORE UPDATE ON public.creditScores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aiCreditScores_updatedAt BEFORE UPDATE ON public.aiCreditScores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Database schema created successfully!' AS status;