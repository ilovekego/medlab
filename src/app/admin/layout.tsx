'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from '@/components/AdminSidebar';
import { 
  Plus, 
  ChevronRight, 
  ChevronDown,
  CheckCircle,
  FileSpreadsheet,
  Headphones,
  Boxes,
  Sparkles,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Clock,
  Database
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If viewing the admin login portal, bypass layout authentication check
    if (pathname?.startsWith('/admin/login')) {
      setIsAuthenticated(true);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('medlab_access_token') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('medlab_user') : null;

    if (!token || !userStr) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('medlab_access_token');
        localStorage.removeItem('medlab_user');
        document.cookie = 'medlab_access_token=; path=/; max-age=0; SameSite=Lax';
      }
      setIsAuthenticated(false);
      const redirectUrl = pathname && pathname !== '/admin' 
        ? `/admin/login?redirect=${encodeURIComponent(pathname)}` 
        : '/admin/login';
      router.replace(redirectUrl);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const allowedRoles = ['Super Admin', 'Admin'];
      if (!user?.role || !allowedRoles.includes(user.role) || user.status === 'Inactive') {
        throw new Error('Unauthorized role or inactive status');
      }

      setCurrentUser(user);

      // Ensure cookie is in sync with localStorage for server-side Next.js middleware
      document.cookie = `medlab_access_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;

      // Route-level RBAC enforcement: check user.permissions against accessed route
      if (user.role !== 'Super Admin' && pathname && pathname !== '/admin') {
        const routeModuleMap: Record<string, string> = {
          '/admin/products': 'products',
          '/admin/categories': 'categories',
          '/admin/media': 'media',
          '/admin/enquiries': 'enquiries',
          '/admin/quotations': 'quotations',
          '/admin/support': 'support',
          '/admin/ai': 'ai',
          '/admin/logs': 'logs',
          '/admin/database': 'database',
          '/admin/settings': 'settings',
          '/admin/users': 'users',
        };

        const matchedEntry = Object.entries(routeModuleMap).find(([routePrefix]) =>
          pathname.startsWith(routePrefix)
        );

        if (matchedEntry) {
          const requiredModule = matchedEntry[1];
          const userPermissions: string[] = Array.isArray(user.permissions)
            ? user.permissions
            : [];
          if (!userPermissions.includes(requiredModule)) {
            router.replace('/admin');
            return;
          }
        }
      }

      setIsAuthenticated(true);
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('medlab_access_token');
        localStorage.removeItem('medlab_user');
        document.cookie = 'medlab_access_token=; path=/; max-age=0; SameSite=Lax';
      }
      setIsAuthenticated(false);
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  // Close user profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar and dropdowns on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medlab_access_token');
      localStorage.removeItem('medlab_user');
      document.cookie = 'medlab_access_token=; path=/; max-age=0; SameSite=Lax';
      window.location.href = '/admin/login';
    }
  };

  // For /admin/login, render standalone without sidebar or top operations header
  if (pathname?.startsWith('/admin/login')) {
    return <div className="admin-login-shell">{children}</div>;
  }

  if (isAuthenticated !== true) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  // Generate dynamic breadcrumbs
  const pathSegments = pathname
    ?.replace('/admin', '')
    .split('/')
    .filter(Boolean) || [];

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  return (
    <div className="admin-shell min-h-screen bg-[#F8FAFC] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Administrative Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header Bar: Clean Frosted Glass with Curvy Design */}
        <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
          
          {/* Left: Mobile Menu Toggle + Desktop Sidebar Toggle + Breadcrumbs */}
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center shrink-0"
              aria-label="Toggle Mobile Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2.5 rounded-2xl bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition items-center justify-center shrink-0"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-sky-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Curvy Breadcrumbs Capsule */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 border border-slate-200/70 text-xs font-semibold text-slate-600 shadow-2xs">
              <Link href="/admin" className="font-bold text-slate-900 hover:text-sky-600 transition flex items-center gap-1.5 shrink-0">
                <Boxes className="w-3.5 h-3.5 text-sky-600" />
                <span>Console</span>
              </Link>
              {pathSegments.length === 0 ? (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="font-bold text-sky-600">Dashboard</span>
                </>
              ) : (
                pathSegments.map((segment, index) => (
                  <React.Fragment key={index}>
                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="capitalize font-bold text-sky-600 truncate">
                      {segment.replace(/-/g, ' ')}
                    </span>
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* Right: Quick Action, Status Pill, Notifications, User Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Action Button: Add Equipment */}
            <Link
              href="/admin/products/new"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-sm shadow-sky-600/20 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Equipment</span>
            </Link>

            {/* Live Operational Status Pill */}
            <div className="hidden xl:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ISO 13485 Live</span>
            </div>

            {/* Curvy User Profile Capsule with Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/70 transition shadow-2xs cursor-pointer group"
                aria-label="User profile menu"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  {userInitials}
                </div>
                <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[100px] truncate">
                  {currentUser?.name || 'Admin'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1.5">
                  {/* User Profile Header */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {currentUser?.name || 'Administrator'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                      {currentUser?.email || 'admin@medlabinnovate.co.ke'}
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100/80 text-sky-700 text-[10px] font-extrabold uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3 text-sky-600" />
                        <span>{currentUser?.role || 'Super Admin'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/admin/users"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Authorized Personnel &amp; RBAC</span>
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                      <span>Website Settings Hub</span>
                    </Link>

                    <Link
                      href="/admin/logs"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Audit &amp; Activity Logs</span>
                    </Link>

                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>View Public Website</span>
                    </Link>
                  </div>

                  {/* Divider & Logout Button */}
                  <div className="pt-1.5 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out of Console</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Nested Page Content with generous canvas padding */}
        <main className="admin-canvas flex-1 p-6 sm:p-8 lg:p-10 max-w-[1720px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
