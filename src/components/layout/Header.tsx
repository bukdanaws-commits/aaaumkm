'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  Search,
  Menu,
  Bell,
  MessageSquare,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  Plus,
  CreditCard,
  LayoutDashboard,
  Shield,
  Moon,
  Sun,
  Monitor,
  Coins,
} from 'lucide-react';

const publicNavItems = [
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Tentang', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];

function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-foreground hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 hover:text-purple-700 dark:hover:text-purple-300 hover:scale-105 transition-all duration-300">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [unreadCount, setUnreadCount] = React.useState(0);

  const initials = user?.user_metadata?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'U';

  // Fetch unread notifications count
  React.useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch('/api/notifications?unread=true');
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.unreadCount || 0);
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background shadow-sm">
      <div className="container px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Center: Search Bar */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, toko, atau kategori..."
                className="w-full pl-10 pr-10 h-10 rounded-full border-border bg-muted/50 text-foreground text-sm focus:bg-background focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              />
              <Button 
                type="submit" 
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 flex items-center justify-center shadow-[0_2px_10px_rgba(147,51,234,0.4)] hover:shadow-[0_4px_20px_rgba(147,51,234,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 ease-out group/search"
              >
                <Search className="h-3.5 w-3.5 text-white group-hover/search:rotate-12 transition-transform duration-300" />
              </Button>
            </div>
          </form>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1.5">
          {user ? (
            <>
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Jual Barang Button */}
              <Button 
                size="sm" 
                className="hidden sm:flex gap-1.5 h-9 text-xs rounded-full px-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-[0_4px_14px_0_rgba(147,51,234,0.5)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.7)] hover:scale-[1.05] hover:-translate-y-0.5 active:scale-[0.98] active:shadow-[0_2px_8px_rgba(147,51,234,0.4)] transition-all duration-300 ease-out relative overflow-hidden group/btn before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700 before:ease-in-out" 
                asChild
              >
                <Link href="/listing/create">
                  <Plus className="h-3.5 w-3.5 group-hover/btn:rotate-90 transition-transform duration-300" />
                  <span>Jual Barang</span>
                </Link>
              </Button>

              {/* Credits Display */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex gap-1 h-9 rounded-full px-3.5 text-foreground hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 hover:text-purple-700 dark:hover:text-purple-300 hover:scale-105 transition-all duration-300" 
                asChild
              >
                <Link href="/credits">
                  <Coins className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {creditsLoading ? '...' : credits?.balance || 0}
                  </span>
                </Link>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative hidden md:flex h-9 w-9 rounded-full text-foreground hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 hover:text-purple-700 dark:hover:text-purple-300 hover:scale-105 transition-all duration-300" asChild>
                <Link href="/dashboard/notifications">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Messages */}
              <Button variant="ghost" size="icon" className="relative hidden md:flex h-9 w-9 rounded-full text-foreground hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 hover:text-purple-700 dark:hover:text-purple-300 hover:scale-105 transition-all duration-300" asChild>
                <Link href="/messages">
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full text-foreground hover:ring-2 hover:ring-purple-500/50 hover:scale-105 transition-all duration-300">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata?.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders" className="flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Pesanan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/credits" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Credits
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user?.user_metadata?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Pengaturan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Theme Toggle for non-logged in users */}
              <ThemeToggle />

              {/* Jual Barang Button for non-logged in users */}
              <Button 
                size="sm" 
                className="hidden md:flex gap-1.5 h-9 text-xs rounded-full px-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white font-semibold shadow-[0_4px_14px_0_rgba(147,51,234,0.5)] hover:shadow-[0_8px_25px_rgba(147,51,234,0.7)] hover:scale-[1.05] hover:-translate-y-0.5 active:scale-[0.98] active:shadow-[0_2px_8px_rgba(147,51,234,0.4)] transition-all duration-300 ease-out relative overflow-hidden group/btn before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700 before:ease-in-out" 
                asChild
              >
                <Link href="/auth">
                  <Plus className="h-3.5 w-3.5 group-hover/btn:rotate-90 transition-transform duration-300" />
                  <span>Jual Barang</span>
                </Link>
              </Button>

              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-9 rounded-full hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 hover:text-purple-700 dark:hover:text-purple-300 hover:scale-105 transition-all duration-300" asChild>
                  <Link href="/auth">Masuk</Link>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full text-foreground hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/30 dark:hover:to-blue-950/30 hover:text-purple-700 dark:hover:text-purple-300 hover:scale-105 transition-all duration-300">
                <Menu className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden border-t px-4 py-2">
        <form onSubmit={handleSearch}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-10 pr-10 h-9 rounded-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            />
            <Button 
              type="submit" 
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 shadow-[0_2px_8px_rgba(147,51,234,0.4)] hover:shadow-[0_4px_16px_rgba(147,51,234,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 ease-out group/search"
            >
              <Search className="h-3 w-3 text-white group-hover/search:rotate-12 transition-transform duration-300" />
            </Button>
          </div>
        </form>
      </div>
    </header>
  );
}
