import { getSupabaseClient } from './supabase-client'
import { findMany, findOne, findOneBy, count } from './supabase-queries'
import { Listing, Profile, Category, Order } from '@/types/supabase'

/**
 * Optimized Database Query Helpers
 * Menggunakan Supabase queries untuk performance
 */

/**
 * Get featured listings dengan optimized query
 */
export async function getFeaturedListings(limit = 10) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      price,
      slug,
      listing_images!inner (imageUrl),
      profiles!inner (name, avatarUrl),
      categories!inner (name, slug)
    `)
    .eq('status', 'active')
    .eq('isFeatured', true)
    .order('createdAt', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get latest listings dengan optimized query
 */
export async function getLatestListings(limit = 12) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      price,
      slug,
      listing_images!inner (imageUrl),
      profiles!inner (name, avatarUrl)
    `)
    .eq('status', 'active')
    .order('createdAt', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get popular listings dengan optimized query
 */
export async function getPopularListings(limit = 12) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      price,
      slug,
      viewCount,
      listing_images!inner (imageUrl),
      profiles!inner (name, avatarUrl)
    `)
    .eq('status', 'active')
    .order('viewCount', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get user profile dengan minimal data
 */
export async function getUserProfile(userId: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      name,
      avatarUrl,
      city,
      province,
      user_roles (role)
    `)
    .eq('userId', userId)
    .single()

  if (error) throw error
  return data
}

/**
 * Get listings by category dengan pagination
 */
export async function getListingsByCategory(
  categoryId: string,
  page = 1,
  limit = 20
) {
  const offset = (page - 1) * limit
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      price,
      slug,
      listing_images!inner (imageUrl),
      profiles!inner (name, avatarUrl)
    `)
    .eq('categoryId', categoryId)
    .eq('status', 'active')
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

/**
 * Get all categories dengan minimal data
 */
export async function getAllCategories() {
  const supabase = getSupabaseClient()
  const { data, error } = await findMany<Category>(supabase, 'categories', {
    filters: { isActive: true },
    select: 'id, name, slug, icon, color, iconUrl, imageBannerUrl, listingCount',
    orderBy: [{ column: 'sortOrder', ascending: true }]
  })

  if (error) throw error
  return data
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await findOneBy<Category>(supabase, 'categories', { slug })

  if (error) throw error
  return data
}

/**
 * Get listing by slug dengan detail lengkap
 */
export async function getListingBySlug(slug: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      slug,
      description,
      price,
      priceType,
      condition,
      city,
      province,
      viewCount,
      favoriteCount,
      listing_images (
        imageUrl,
        isPrimary
      ),
      profiles (
        id,
        name,
        email,
        phone,
        avatarUrl,
        city,
        province,
        averageRating,
        totalReviews
      ),
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

/**
 * Get user listings dengan pagination
 */
export async function getUserListings(
  userId: string,
  page = 1,
  limit = 20
) {
  const offset = (page - 1) * limit
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      price,
      slug,
      status,
      viewCount,
      listing_images!inner (imageUrl)
    `)
    .eq('userId', userId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

/**
 * Get user orders dengan pagination
 */
export async function getUserOrders(
  userId: string,
  page = 1,
  limit = 20
) {
  const offset = (page - 1) * limit
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      totalAmount,
      createdAt,
      buyer:profiles!buyerId (
        name,
        avatarUrl
      ),
      seller:profiles!sellerId (
        name,
        avatarUrl
      )
    `)
    .or(`buyerId.eq.${userId},sellerId.eq.${userId}`)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(userId: string) {
  const supabase = getSupabaseClient()
  
  const [
    { count: totalListings },
    { count: activeListings },
    { count: totalOrders },
    { data: orders },
    { data: profile }
  ] = await Promise.all([
    count(supabase, 'listings', { userId }),
    count(supabase, 'listings', { userId, status: 'active' }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).or(`buyerId.eq.${userId},sellerId.eq.${userId}`),
    supabase.from('orders').select('totalAmount').eq('sellerId', userId),
    findOneBy<Profile>(supabase, 'profiles', { userId })
  ])

  const totalRevenue = orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0

  return {
    totalListings: totalListings || 0,
    activeListings: activeListings || 0,
    totalOrders: totalOrders || 0,
    totalRevenue,
    averageRating: profile?.averageRating || 0,
  }
}

/**
 * Search listings dengan optimized query
 */
export async function searchListings(
  query: string,
  page = 1,
  limit = 20
) {
  const offset = (page - 1) * limit
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      price,
      slug,
      listing_images!inner (imageUrl),
      profiles!inner (name, avatarUrl)
    `)
    .eq('status', 'active')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}
