'use client';

import { useState, useEffect, useCallback } from 'react';

// Types
interface AdminStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalOrders: number;
  totalRevenue: number;
  pendingReports: number;
  pendingKyc: number;
  pendingWithdrawals: number;
  newUsersToday: number;
  newListingsToday: number;
  newOrdersToday: number;
}

interface PendingListing {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  seller_name: string;
}

interface RecentReport {
  id: string;
  listing: { title: string };
  reason: string;
  status: string;
}

interface AdminDashboardData {
  stats: AdminStats | null;
  pendingListings: PendingListing[];
  recentReports: RecentReport[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminDashboard(): AdminDashboardData {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get demo user from localStorage for authentication
      const demoUser = localStorage.getItem('demoUser');
      const headers: HeadersInit = {};
      
      if (demoUser) {
        const user = JSON.parse(demoUser);
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const response = await fetch('/api/admin/stats', { headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        } else if (response.status === 403) {
          throw new Error('Forbidden - Admin access required');
        }
        throw new Error('Failed to fetch admin stats');
      }

      const data = await response.json();
      setStats(data.stats);
      setPendingListings(data.pendingListings);
      setRecentReports(data.recentReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    pendingListings,
    recentReports,
    loading,
    error,
    refetch: fetchData,
  };
}

// Admin Users Hook
interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
  status: string;
  kyc_status: string;
  is_kyc_verified: boolean;
  total_listings: number;
  total_orders_as_buyer: number;
  total_orders_as_seller: number;
  wallet_balance: number;
  credit_balance: number;
  created_at: string;
}

interface AdminUsersData {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserStatus: (userId: string, status: string) => Promise<{ success: boolean; error?: string }>;
}

interface UseAdminUsersOptions {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}): AdminUsersData {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<AdminUsersData['pagination']>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.role) params.append('role', options.role);
      if (options.status) params.append('status', options.status);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      // Get demo user from localStorage for authentication
      const demoUser = localStorage.getItem('demoUser');
      const headers: HeadersInit = {};
      
      if (demoUser) {
        const user = JSON.parse(demoUser);
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [options.search, options.role, options.status, options.page, options.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateUserRole = async (userId: string, role: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get demo user from localStorage for authentication
      const demoUser = localStorage.getItem('demoUser');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (demoUser) {
        const user = JSON.parse(demoUser);
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          userId,
          action: 'update_role',
          data: { role },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update role' };
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role } : u
      ));

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const toggleUserStatus = async (userId: string, status: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get demo user from localStorage for authentication
      const demoUser = localStorage.getItem('demoUser');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (demoUser) {
        const user = JSON.parse(demoUser);
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          userId,
          action: 'toggle_status',
          data: { status },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update status' };
      }

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status } : u
      ));

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchData,
    updateUserRole,
    toggleUserStatus,
  };
}

// Admin Listings Hook
interface AdminListing {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  condition: string;
  listing_type: string;
  view_count: number;
  favorite_count: number;
  created_at: string;
  approved_at: string | null;
  rejected_reason: string | null;
  primary_image: string | null;
  category: string | null;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  report_count: number;
}

interface AdminListingsData {
  listings: AdminListing[];
  loading: boolean;
  error: string | null;
  countsByStatus: Record<string, number>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  approveListing: (listingId: string) => Promise<{ success: boolean; error?: string }>;
  rejectListing: (listingId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  updateListingStatus: (listingId: string, status: string) => Promise<{ success: boolean; error?: string }>;
  bulkApprove: (listingIds: string[]) => Promise<{ success: boolean; error?: string }>;
}

interface UseAdminListingsOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useAdminListings(options: UseAdminListingsOptions = {}): AdminListingsData {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<AdminListingsData['pagination']>(null);
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.status) params.append('status', options.status);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());

      // Get demo user from localStorage for authentication
      const demoUser = localStorage.getItem('demoUser');
      const headers: HeadersInit = {};
      
      if (demoUser) {
        const user = JSON.parse(demoUser);
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const response = await fetch(`/api/admin/listings?${params.toString()}`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      setListings(data.listings);
      setPagination(data.pagination);
      setCountsByStatus(data.counts_by_status || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [options.search, options.status, options.page, options.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const approveListing = async (listingId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get demo user from localStorage for authentication
      const demoUser = localStorage.getItem('demoUser');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (demoUser) {
        const user = JSON.parse(demoUser);
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const response = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          listingId,
          action: 'approve',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to approve listing' };
      }

      // Update local state
      setListings(prev => prev.map(l => 
        l.id === listingId ? { ...l, status: 'active', approved_at: new Date().toISOString() } : l
      ));

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const rejectListing = async (listingId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get demo user from localStorage for authentication
      const demoUser = localStorage.getItem('demoUser');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (demoUser) {
        const user = JSON.parse(demoUser);
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const response = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          listingId,
          action: 'reject',
          data: { reason },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to reject listing' };
      }

      // Update local state
      setListings(prev => prev.map(l => 
        l.id === listingId ? { ...l, status: 'rejected', rejected_reason: reason } : l
      ));

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const updateListingStatus = async (listingId: string, status: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get demo user from localStorage for authentication
      const demoUser = localStorage.getItem('demoUser');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (demoUser) {
        const user = JSON.parse(demoUser);
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const response = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          listingId,
          action: 'toggle_status',
          data: { status },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update status' };
      }

      // Update local state
      setListings(prev => prev.map(l => 
        l.id === listingId ? { ...l, status } : l
      ));

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const bulkApprove = async (listingIds: string[]): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get demo user from localStorage for authentication
      const demoUser = localStorage.getItem('demoUser');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      
      if (demoUser) {
        const user = JSON.parse(demoUser);
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      const response = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          listingId: '',
          action: 'bulk_approve',
          data: { listingIds },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to bulk approve' };
      }

      // Update local state
      const now = new Date().toISOString();
      setListings(prev => prev.map(l => 
        listingIds.includes(l.id) ? { ...l, status: 'active', approved_at: now } : l
      ));

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    listings,
    loading,
    error,
    countsByStatus,
    pagination,
    refetch: fetchData,
    approveListing,
    rejectListing,
    updateListingStatus,
    bulkApprove,
  };
}
