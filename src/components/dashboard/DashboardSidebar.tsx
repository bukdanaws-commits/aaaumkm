'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Wallet,
  Package,
  ShoppingCart,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Plus,
  Coins,
  Home,
  ShoppingBag,
  Heart,
  ArrowDownCircle,
  Shield,
  HelpCircle,
  Ticket,
  Bell,
  ChevronLeft,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Iklan Saya', url: '/dashboard/listings', icon: Package },
  { title: 'Pesanan', url: '/dashboard/orders', icon: ShoppingCart },
  { title: 'Pesan', url: '/dashboard/messages', icon: MessageCircle, badge: true },
  { title: 'Notifikasi', url: '/dashboard/notifications', icon: Bell, badge: true },
  { title: 'Wishlist', url: '/dashboard/wishlist', icon: Heart },
];

const walletNavItems = [
  { title: 'Wallet', url: '/dashboard/wallet', icon: Wallet },
  { title: 'Penarikan', url: '/dashboard/withdraw', icon: ArrowDownCircle },
  { title: 'Kupon', url: '/dashboard/coupons', icon: Ticket },
];

const otherNavItems = [
  { title: 'AI Credit Scoring', url: '/dashboard/ai-credit-score', icon: Brain },
  { title: 'Verifikasi KYC', url: '/dashboard/kyc', icon: Shield },
  { title: 'Bantuan', url: '/dashboard/support', icon: HelpCircle },
];

const quickLinks = [
  { title: 'Beranda', url: '/', icon: Home },
  { title: 'Marketplace', url: '/marketplace', icon: ShoppingBag },
  { title: 'Beli Kredit', url: '/credits', icon: Coins },
];

export function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const { signOut, user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const isCollapsed = state === 'collapsed';

  // Fetch unread notifications count
  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const response = await fetch('/api/notifications?unread=true');
        if (response.ok) {
          const data = await response.json();
          setUnreadNotifications(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    }

    if (user) {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  // Mock credits - in real app this would come from a hook
  const credits = 0;
  const unreadCount = 0;

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-800 bg-black">
      <SidebarHeader className="border-b border-gray-800 p-4 bg-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={!isCollapsed} />
            {!isCollapsed && user?.email && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 truncate max-w-[140px]">
                  {user.email}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-purple-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 mt-2 mx-auto bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-purple-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-black">
        {/* Quick Action */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-3">
              <Button
                onClick={() => router.push('/listing/create')}
                className="w-full justify-start gap-2 shadow-sm"
                size={isCollapsed ? 'icon' : 'default'}
              >
                <Plus className="h-4 w-4" />
                {!isCollapsed && <span>Jual Barang</span>}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                    className={cn(
                      isActive(item.url)
                        ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-purple-800'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    )}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                      {item.badge && item.title === 'Pesan' && unreadCount > 0 && !isCollapsed && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                      {item.badge && item.title === 'Notifikasi' && unreadNotifications > 0 && !isCollapsed && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Wallet & Finance */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Keuangan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {walletNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                    className={cn(
                      isActive(item.url)
                        ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-purple-800'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    )}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Links */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Pintasan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={isCollapsed ? item.title : undefined}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Other */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Lainnya</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                    className={cn(
                      isActive(item.url)
                        ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-purple-800'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    )}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Pengaturan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/profile')}
                  tooltip={isCollapsed ? 'Profil' : undefined}
                  className={cn(
                    isActive('/dashboard/profile')
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-purple-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                >
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3"
                  >
                    <User className="h-4 w-4" />
                    {!isCollapsed && <span>Profil</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/settings')}
                  tooltip={isCollapsed ? 'Pengaturan' : undefined}
                  className={cn(
                    isActive('/dashboard/settings')
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-purple-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                >
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3"
                  >
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span>Pengaturan</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-800 p-2 bg-black">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'text-red-400 hover:text-red-300 hover:bg-red-950/30 w-full transition-all',
            isCollapsed ? 'justify-center px-2' : 'justify-start'
          )}
          title={isCollapsed ? 'Keluar' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Keluar</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
