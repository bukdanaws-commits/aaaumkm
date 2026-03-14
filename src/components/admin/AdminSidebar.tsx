'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Package,
  AlertTriangle,
  FileCheck,
  ShoppingCart,
  Banknote,
  Image,
  MessageCircle,
  CreditCard,
  BarChart3,
  FileText,
  Tag,
  Settings,
  Layers,
  Zap,
  Radio,
  LogOut,
  Shield,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Utama',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Analitik', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Log Aktivitas', href: '/admin/activity-log', icon: FileText },
    ],
  },
  {
    title: 'Manajemen Pengguna',
    items: [
      { label: 'Pengguna', href: '/admin/users', icon: Users },
      { label: 'Verifikasi KYC', href: '/admin/kyc', icon: FileCheck },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      { label: 'Iklan', href: '/admin/listings', icon: Package },
      { label: 'Laporan', href: '/admin/reports', icon: AlertTriangle },
      { label: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Kategori', href: '/admin/categories', icon: Layers },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { label: 'Penarikan', href: '/admin/withdrawals', icon: Banknote },
      { label: 'Kredit', href: '/admin/credits', icon: CreditCard },
      { label: 'Topup Request', href: '/admin/topup-requests', icon: DollarSign },
      { label: 'Kupon', href: '/admin/coupons', icon: Tag },
    ],
  },
  { 
    title: 'Promosi',
    items: [
      { label: 'Banner', href: '/admin/banners', icon: Image },
      { label: 'Boost Settings', href: '/admin/boost-settings', icon: Zap },
      { label: 'Broadcast', href: '/admin/broa  dcast', icon: Radio },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Tiket Support', href: '/admin/support', icon: MessageCircle },
    ],
  },
  {
    title: 'Pengaturan',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const { signOut, user } = useAuth();

  const isCollapsed = state === 'collapsed';

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-800 bg-black">
      <SidebarHeader className="border-b border-gray-800 p-4 bg-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 text-white shadow-lg">
              <Shield className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Admin Panel</span>
                <span className="text-xs text-gray-400 truncate max-w-[140px]">
                  {user?.email}
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
        {sidebarItems.map((group) => (
          <SidebarGroup key={group.title}>
            {!isCollapsed && <SidebarGroupLabel className="text-gray-400">{group.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                          'hover:bg-gray-800',
                          isCollapsed ? 'justify-center' : '',
                          active
                            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-purple-800'
                            : 'text-gray-400 hover:text-white'
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span className="text-sm">{item.label}</span>}
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
