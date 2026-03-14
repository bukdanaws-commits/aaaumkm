'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  walletBalance: number;
  creditsBalance: number;
  activeListings: number;
  totalListings: number;
  totalOrders: number;
  pendingOrders: number;
  unreadMessages: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

interface ListingImage {
  image_url: string;
  is_primary: boolean;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  view_count: number;
  listing_images: ListingImage[];
}

interface Order {
  id: string;
  listing: { title: string } | null;
  amount: number;
  status: string;
  created_at: string;
}

interface DashboardData {
  stats: DashboardStats;
  transactions: Transaction[];
  listings: Listing[];
  orders: Order[];
  loading: boolean;
}

export function useDashboardData(): DashboardData {
  const [stats, setStats] = useState<DashboardStats>({
    walletBalance: 0,
    creditsBalance: 0,
    activeListings: 0,
    totalListings: 0,
    totalOrders: 0,
    pendingOrders: 0,
    unreadMessages: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setTransactions(data.transactions);
        setListings(data.listings);
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    transactions,
    listings,
    orders,
    loading,
  };
}
