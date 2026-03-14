/**
 * Type definitions for Supabase tables
 * Generated based on database schema
 */

export interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  imageBannerUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  listingCount: number;
  umkmCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  creditsAmount: number;
  maxUses: number;
  usedCount: number;
  minPurchase: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdById: string | null;
  createdAt: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'expired' | 'topup' | 'adjustment';
  amount: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  paymentId: string | null;
  createdAt: string;
}

export interface CreditTopupRequest {
  id: string;
  userId: string;
  packageId: string | null;
  amount: number;
  creditsAmount: number;
  bonusCredits: number;
  paymentProof: string | null;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  slug: string | null;
  description: string | null;
  price: number;
  priceType: 'fixed' | 'negotiable' | 'auction';
  listingType: 'sale' | 'rent' | 'service' | 'wanted';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  status: 'draft' | 'pending_review' | 'active' | 'sold' | 'expired' | 'rejected' | 'deleted';
  city: string | null;
  province: string | null;
  provinceId: string | null;
  regencyId: string | null;
  districtId: string | null;
  villageId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  address: string | null;
  viewCount: number;
  clickCount: number;
  shareCount: number;
  favoriteCount: number;
  inquiryCount: number;
  isFeatured: boolean;
  featuredUntil: string | null;
  keywords: string | null;
  attributes: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  soldTo: string | null;
  soldAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListingImage {
  id: string;
  listingId: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  totalAmount: number;
  notes: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  province: string | null;
  provinceId: string | null;
  regencyId: string | null;
  districtId: string | null;
  villageId: string | null;
  postalCode: string | null;
  website: string | null;
  isVerified: boolean;
  isKycVerified: boolean;
  primaryRole: string;
  isActive: boolean;
  totalListings: number;
  activeListings: number;
  soldCount: number;
  totalSales: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: 'topup' | 'withdrawal' | 'payment' | 'refund' | 'commission' | 'bonus' | 'transfer_in' | 'transfer_out' | 'adjustment';
  amount: number;
  balanceBefore: number | null;
  balanceAfter: number | null;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  isReversed: boolean;
  createdAt: string;
}

export interface UMKMProfile {
  id: string;
  ownerId: string;
  umkmName: string;
  brandName: string | null;
  slug: string | null;
  description: string | null;
  tagline: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  category: string | null;
  subcategory: string | null;
  categoryId: string | null;
  businessScale: string | null;
  businessType: string | null;
  npwp: string | null;
  nib: string | null;
  provinceId: string | null;
  regencyId: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  isVerified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
  status: string;
  viewCount: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserCredit {
  id: string;
  userId: string;
  balance: number;
  totalPurchased: number;
  totalUsed: number;
  totalBonus: number;
  totalExpired: number;
  lastTransactionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currencyCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'paid' | 'failed' | 'cancelled';
  processedBy: string | null;
  processedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface Banner {
  id: string;
  userId: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  position: string;
  pricingModel: string;
  costPerClick: number | null;
  costPerMille: number | null;
  budgetTotal: number;
  budgetSpent: number;
  impressions: number;
  clicks: number;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  listingId: string | null;
  buyerId: string;
  sellerId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface District {
  id: string;
  regencyId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface KycDocument {
  id: string;
  kycVerificationId: string;
  documentType: 'ktp' | 'npwp' | 'siup' | 'tdp' | 'nib' | 'akta' | 'skdp' | 'other';
  documentUrl: string;
  status: string;
  createdAt: string;
}

export interface KycVerification {
  id: string;
  userId: string;
  ktpNumber: string | null;
  npwpNumber: string | null;
  status: 'not_submitted' | 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListingAuction {
  id: string;
  listingId: string;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice: number | null;
  minIncrement: number;
  reservePrice: number | null;
  startsAt: string | null;
  endsAt: string;
  status: string;
  winnerId: string | null;
  totalBids: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListingBoost {
  id: string;
  listingId: string;
  boostType: string;
  status: string;
  creditsCost: number;
  startsAt: string | null;
  endsAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'payment' | 'message' | 'listing' | 'promotion' | 'system';
  title: string;
  message: string | null;
  data: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface Product {
  id: string;
  umkmId: string;
  categoryId: string | null;
  name: string;
  slug: string | null;
  description: string | null;
  price: number | null;
  stock: number;
  sku: string | null;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  status: string;
  primaryImageUrl: string | null;
  viewCount: number;
  totalSold: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface Province {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Regency {
  id: string;
  provinceId: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedListing {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface SellerReview {
  id: string;
  orderId: string;
  sellerId: string;
  reviewerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  website: string | null;
  category: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportReply {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isStaff: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: 'general' | 'account' | 'payment' | 'listing' | 'order' | 'technical' | 'report' | 'suggestion';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  assignedTo: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  lastReplyAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UMKMReview {
  id: string;
  umkmId: string;
  reviewerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  role: 'user' | 'admin' | 'penjual';
  assignedBy: string | null;
  assignedAt: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Village {
  id: string;
  districtId: string;
  name: string;
  type: string | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionBid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  isWinning: boolean;
  isAutoBid: boolean;
  maxAutoAmount: number | null;
  createdAt: string;
}

export interface CouponUse {
  id: string;
  couponId: string;
  userId: string;
  usedAt: string;
}

export interface ListingReport {
  id: string;
  listingId: string;
  reporterId: string;
  reason: string;
  description: string | null;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  action: string | null;
  createdAt: string;
}

export interface CreditScore {
  id: string;
  userId: string;
  totalScore: number;
  businessDurationScore: number;
  revenueScore: number;
  transactionScore: number;
  ratingScore: number;
  kycScore: number;
  assetScore: number;
  paymentHistoryScore: number;
  eligibilityStatus: string;
  recommendedLoanAmount: number;
  riskLevel: string | null;
  lastCalculatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AICreditScore {
  id: string;
  userId: string;
  totalScore: number;
  confidence: number;
  slikScore: number;
  socialMediaScore: number;
  platformScore: number;
  behavioralScore: number;
  verificationScore: number;
  riskLevel: string | null;
  riskFactors: Record<string, any>;
  recommendations: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export interface Testimonial {
  id: string;
  userId: string | null;
  name: string;
  content: string;
  rating: number;
  avatarUrl: string | null;
  company: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}