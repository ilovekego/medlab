'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, FileText, Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { gsap } from 'gsap';
import { CompanyLogo } from '@/components/CompanyLogo';

interface NavbarProps {
  onRequestQuote: () => void;
  onOpenChat: () => void;
}

export function Navbar({ onRequestQuote, onOpenChat }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const iconRefDesktop = useRef<HTMLDivElement>(null);
  const iconRefMobile = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GSAP Smooth Icon Animation without Tailwind class conflicts
  useEffect(() => {
    if (!mounted) return;
    const currentTheme = resolvedTheme || theme;
    const isDark = currentTheme === 'dark';
    const targets = [];
    if (iconRefDesktop.current) targets.push(iconRefDesktop.current);
    if (iconRefMobile.current) targets.push(iconRefMobile.current);

    targets.forEach((container) => {
      const sun = container.querySelector('.icon-sun');
      const moon = container.querySelector('.icon-moon');
      if (!sun || !moon) return;

      if (isFirstRender.current) {
        // Immediate initial position on first mount (no glitch or spin on reload)
        gsap.set(sun, { scale: isDark ? 1 : 0, rotation: isDark ? 0 : -90, opacity: isDark ? 1 : 0 });
        gsap.set(moon, { scale: isDark ? 0 : 1, rotation: isDark ? 90 : 0, opacity: isDark ? 0 : 1 });
      } else {
        // Butter-smooth GSAP rotation on theme switch
        if (isDark) {
          gsap.to(sun, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' });
          gsap.to(moon, { scale: 0, rotation: 90, opacity: 0, duration: 0.35, ease: 'power2.in' });
        } else {
          gsap.to(sun, { scale: 0, rotation: -90, opacity: 0, duration: 0.35, ease: 'power2.in' });
          gsap.to(moon, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' });
        }
      }
    });

    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [resolvedTheme, theme, mounted]);

  // Ultra-Smooth Theme Switcher with Circular Expanding Ripple
  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const currentTheme = resolvedTheme || theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Tactile button bounce
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.88 },
      { scale: 1, duration: 0.35, ease: 'back.out(2)' }
    );

    const doc = typeof document !== 'undefined' ? (document as any) : null;
    if (!doc) {
      setTheme(newTheme);
      return;
    }

    // If View Transitions API is available, animate a smooth circular expanding ripple
    if (typeof doc.startViewTransition === 'function') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      doc.documentElement.classList.add('theme-transitioning');

      const transition = doc.startViewTransition(() => {
        setTheme(newTheme);
      });

      transition.ready?.then(() => {
        doc.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 480,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });

      transition.finished?.finally(() => {
        doc.documentElement.classList.remove('theme-transitioning');
      });
    } else {
      // Fallback: smooth crossfade CSS transition
      doc.documentElement.classList.add('theme-transitioning');
      setTheme(newTheme);
      setTimeout(() => {
        doc.documentElement.classList.remove('theme-transitioning');
      }, 480);
    }
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/products', label: 'Products' },
    { href: '/services', label: 'Services' },
    { href: '/industries', label: 'Industries' },
    { href: '/support', label: 'Support' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActiveLink = (href: string) => {
    if (!pathname) return href === '/';
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B121E]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none transition-all">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] sm:h-[72px] gap-4">
          
          {/* Logo on the left */}
          <div className="flex items-center shrink-0">
            <CompanyLogo variant="dark" className="h-10 sm:h-11 w-auto" />
          </div>

          {/* Desktop Navigation Links (Centered, with active underline like reference) */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'text-[#1769E0] dark:text-[#38BDF8] font-semibold'
                      : 'text-[#10233F] dark:text-slate-300 hover:text-[#1769E0] dark:hover:text-[#38BDF8]'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span className="absolute -bottom-[23px] sm:-bottom-[25px] left-0 right-0 h-[2.5px] bg-[#1769E0] dark:bg-[#38BDF8] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons: AI Advisor & Request Quote */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-[#10233F] dark:text-slate-200 hover:bg-[#F8FAFC] dark:hover:bg-[#16233B] border border-[#E2E8F0] dark:border-slate-800 transition-colors shadow-xs"
                aria-label="Toggle theme"
              >
                <div ref={iconRefDesktop} className="relative w-4 h-4">
                  <Sun className="icon-sun absolute inset-0 w-4 h-4 text-amber-400 pointer-events-none" />
                  <Moon className="icon-moon absolute inset-0 w-4 h-4 text-slate-700 dark:text-slate-200 pointer-events-none" />
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#10233F] dark:text-slate-200 bg-white dark:bg-[#111C2E] hover:bg-[#F8FAFC] dark:hover:bg-[#16233B] border border-[#E2E8F0] dark:border-slate-800 hover:border-[#CBD5E1] dark:hover:border-slate-700 rounded-lg transition-colors shadow-xs"
              title="Open AI Engineering Advisor"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#1769E0] dark:text-[#38BDF8] shrink-0" />
              <span>AI Engineering Advisor</span>
            </button>

            <button
              type="button"
              onClick={onRequestQuote}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1769E0] hover:bg-[#1258BF] rounded-lg transition-all shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Request Quote</span>
            </button>
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-[#10233F] dark:text-slate-200 hover:bg-[#F8FAFC] dark:hover:bg-[#16233B] border border-[#E2E8F0] dark:border-slate-800 transition-colors shadow-xs"
                aria-label="Toggle theme"
              >
                <div ref={iconRefMobile} className="relative w-4 h-4">
                  <Sun className="icon-sun absolute inset-0 w-4 h-4 text-amber-400 pointer-events-none" />
                  <Moon className="icon-moon absolute inset-0 w-4 h-4 text-slate-700 dark:text-slate-200 pointer-events-none" />
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="relative z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] dark:border-slate-800 text-[#10233F] dark:text-slate-200 transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#16233B] hover:text-[#1769E0] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="relative z-40 border-b border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#0B121E] px-4 pb-5 pt-3 shadow-[0_12px_24px_rgba(15,42,67,0.08)] dark:shadow-none lg:hidden">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-[#F0F6FE] dark:bg-[#16233B] text-[#1769E0] dark:text-[#38BDF8] font-semibold'
                      : 'text-[#10233F] dark:text-slate-300 hover:bg-[#F8FAFC] dark:hover:bg-[#16233B]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChat();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#10233F] dark:text-slate-200 bg-white dark:bg-[#111C2E] border border-[#E2E8F0] dark:border-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-[#16233B] rounded-lg shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
              <span>AI Engineering Advisor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestQuote();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1769E0] hover:bg-[#1258BF] rounded-lg shadow-xs"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Request a Quote (RFQ)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
