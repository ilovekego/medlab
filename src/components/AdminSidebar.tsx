'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  FileSpreadsheet,
  FileCheck,
  Headphones,
  Bot,
  BrainCircuit,
  Settings2,
  FolderOpen,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Clock,
  Users,
  Database,
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  const sections: NavSection[] = [
    {
      title: 'Workspace',
      items: [
        { name: 'Overview Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Equipment Catalog', href: '/admin/products', icon: Boxes },
      ],
    },
    {
      title: 'Catalog Management',
      items: [
        { name: 'Categories & Brands', href: '/admin/categories', icon: Layers },
        { name: 'Media & Documents', href: '/admin/media', icon: FolderOpen },
      ],
    },
    {
      title: 'Sales & Requisitions',
      items: [
        { name: 'Enquiries / RFQ', href: '/admin/enquiries', icon: FileSpreadsheet, badge: 'New' },
        { name: 'Quotations', href: '/admin/quotations', icon: FileCheck },
      ],
    },
    {
      title: 'Technical Support',
      items: [
        { name: 'Service Tickets', href: '/admin/support', icon: Headphones, badge: 'Active' },
      ],
    },
    {
      title: 'AI Intelligence',
      items: [
        { name: 'AI Conversations', href: '/admin/ai/conversations', icon: Bot },
        { name: 'Knowledge Base & FAQ', href: '/admin/ai/knowledge', icon: BrainCircuit },
        { name: 'AI Configuration', href: '/admin/ai/settings', icon: Settings2 },
      ],
    },
    {
      title: 'Administration',
      items: [
        { name: 'Users & RBAC', href: '/admin/users', icon: Users },
        { name: 'Database Manager', href: '/admin/database', icon: Database, badge: 'Live' },
        { name: 'Audit & Activity Logs', href: '/admin/logs', icon: Clock },
      ],
    },
  ];

  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('medlab_user');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('medlab_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        // Refresh permissions from Firestore in background if not Super Admin
        if (parsed.role !== 'Super Admin' && (parsed.id || parsed._id)) {
          api.getUsers().then((res) => {
            if (res.success && Array.isArray(res.data)) {
              const fresh = res.data.find(
                (u: any) =>
                  (u._id || u.id) === (parsed.id || parsed._id) ||
                  u.email === parsed.email
              );
              if (fresh && Array.isArray(fresh.permissions)) {
                const merged = { ...parsed, permissions: fresh.permissions, role: fresh.role };
                localStorage.setItem('medlab_user', JSON.stringify(merged));
                setCurrentUser(merged);
              }
            }
          }).catch(() => {});
        }
      }
    } catch {}
  }, []);

  const MODULE_ROUTES: Record<string, string[]> = {
    products: ['/admin/products'],
    categories: ['/admin/categories'],
    media: ['/admin/media'],
    enquiries: ['/admin/enquiries'],
    quotations: ['/admin/quotations'],
    support: ['/admin/support'],
    ai: ['/admin/ai'],
    logs: ['/admin/logs'],
    database: ['/admin/database'],
    settings: ['/admin/settings'],
    users: ['/admin/users'],
  };

  const isItemAllowed = (href: string) => {
    // Super Admin has master unrestricted access across all modules
    if (currentUser?.role === 'Super Admin') return true;
    if (href === '/admin') return true; // Overview Dashboard always accessible

    // For any Admin user, strictly check permissions array:
    const userPermissions: string[] = Array.isArray(currentUser?.permissions)
      ? currentUser.permissions
      : [];

    return Object.entries(MODULE_ROUTES).some(([modKey, routes]) => {
      if (!userPermissions.includes(modKey)) return false;
      return routes.some((r) => href === r || href.startsWith(r + '/'));
    });
  };

  const visibleSections = sections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => isItemAllowed(item.href)),
    }))
    .filter((sec) => sec.items.length > 0);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medlab_access_token');
      localStorage.removeItem('medlab_user');
      document.cookie = 'medlab_access_token=; path=/; max-age=0; SameSite=Lax';
      window.location.href = '/admin/login';
    }
  };

  useEffect(() => {
    navRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  // Isolate wheel scrolling to prevent parent scroll interception
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        data-lenis-prevent
        className={`fixed inset-y-0 left-0 z-40 h-screen bg-white text-slate-700 flex flex-col border-r border-slate-200/80 shadow-[4px_0_24px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-20 shrink-0 flex items-center justify-between px-5 border-b border-slate-100 bg-white">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden group">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20 shrink-0 transition-transform group-hover:scale-105">
                  <Boxes className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-sm text-slate-900 tracking-tight leading-none group-hover:text-sky-600 transition-colors">
                    MEDLAB
                  </div>
                  <div className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mt-1">
                    Admin Console
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-sky-600/20 shrink-0 transition-transform hover:scale-105"
                title="Medlab Admin Console"
              >
                <Boxes className="w-5 h-5 text-white" />
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 rounded-2xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Close Toggle */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div
          ref={navRef}
          data-lenis-prevent
          className="admin-sidebar-scroll flex-1 min-h-0 overflow-y-auto py-5 px-3.5 space-y-6"
          style={{
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {visibleSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-4 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const isActive = item.href === '/admin' 
                  ? pathname === '/admin' 
                  : (pathname === item.href || pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all group relative ${
                      isActive
                        ? 'bg-sky-50 text-sky-600 font-bold border border-sky-200/70 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 border border-transparent'
                    }`}
                    title={collapsed ? item.name : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}

                    {!collapsed && item.badge && (
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 border border-slate-200/80'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {/* Active indicator dot when collapsed */}
                    {collapsed && isActive && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-600" />
                    )}

                    {/* Tooltip on collapsed hover */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 border border-slate-800">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Footer Actions */}
        <div className="shrink-0 p-3.5 border-t border-slate-100 bg-white space-y-2.5">
          {/* Public Portal Link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-sky-600 hover:bg-sky-50/80 transition"
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
            {!collapsed && <span className="truncate">View Public Site</span>}
          </Link>

          {/* User Profile & Logout */}
          <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0">
                {currentUser?.name
                  ? currentUser.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'AD'}
              </div>
              {!collapsed && (
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-sky-600 font-semibold tracking-wide">
                    {currentUser?.role || 'Super Admin'}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 cursor-pointer"
              title="Sign Out of Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
