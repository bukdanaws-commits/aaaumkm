-- Performance Indexes for Supabase
-- Run this in Supabase Dashboard SQL Editor

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_active_parent ON categories(is_active, parent_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order) WHERE is_active = true;

-- Listings indexes - most important for landing page
CREATE INDEX IF NOT EXISTS idx_listings_status_active ON listings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured, status, created_at) WHERE status = 'active' AND is_featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(status, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_views ON listings(status, view_count DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_status_featured ON listings(status, is_featured) WHERE status = 'active';

-- Listing images index
CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON listing_images(listing_id, sort_order);

-- Auctions indexes
CREATE INDEX IF NOT EXISTS idx_auctions_active ON listing_auctions(status, ends_at) WHERE status = 'active';

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- UMKM profiles indexes
CREATE INDEX IF NOT EXISTS idx_umkm_profiles_owner ON umkm_profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_umkm_profiles_status ON umkm_profiles(status);

-- Composite index for common listing queries
CREATE INDEX IF NOT EXISTS idx_listings_landing ON listings(status, is_featured, created_at DESC) 
WHERE status = 'active';

-- Analyze tables to update statistics
ANALYZE listings;
ANALYZE categories;
ANALYZE listing_auctions;