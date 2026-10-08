'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  ShieldCheck
} from 'lucide-react';

const ALLOWED_ADMIN_ROLES = [
  'Super Admin',
  'Admin'
];

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in with authorized role, auto-redirect to /admin
  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('medlab_access_token') : null;
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('medlab_user') : null;
      if (token && userStr) {
        const user = JSON.parse(userStr);
        if (ALLOWED_ADMIN_ROLES.includes(user?.role) && user?.status !== 'Inactive') {
          router.replace(redirectTarget);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [router, redirectTarget]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // Real database authentication: /api/admin/login endpoint
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const res = await response.json();

      if (res.success && res.token && res.user) {
        localStorage.setItem('medlab_access_token', res.token);
        localStorage.setItem('medlab_user', JSON.stringify(res.user));
        
        const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
        document.cookie = `medlab_access_token=${encodeURIComponent(res.token)}; path=/; max-age=${maxAge}; SameSite=Lax`;

        router.replace(redirectTarget);
        return;
      } else {
        setError(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please check database connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative select-none overflow-hidden">
      {/* Background decorative subtle dot grid & ambient light */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-45 pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-gradient-to-b from-sky-100/60 via-blue-50/30 to-transparent blur-3xl pointer-events-none rounded-full" 
        aria-hidden="true"
      />

      <div className="w-full max-w-[420px] relative z-10">
        
        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <Link 
            href="/" 
            className="inline-block transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            title="Return to Medlab Home"
          >
            <img
              src="/images/logo.svg"
              alt="Medlab Innovate Engineering"
              className="h-12 w-auto mx-auto object-contain drop-shadow-sm"
            />
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-7 sm:p-9 border border-slate-200/90 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08),0_2px_8px_-2px_rgba(15,23,42,0.04)] relative overflow-hidden">
          {/* Subtle top brand accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F2A43] via-[#2563EB] to-[#0EA5A4]" />

          {/* Card Title & Subtitle */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your authorized staff credentials to continue
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email / ID Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Staff Email / Access ID
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@medlabinnovate.co.ke"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 absolute right-2 top-1/2 -translate-y-1/2 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Protection info */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 border-slate-300 bg-white focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
              </label>
              <span className="text-[11px] text-slate-400 inline-flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Encrypted
              </span>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0F2A43] to-[#1E3A8A] hover:from-[#143757] hover:to-[#2446a3] active:scale-[0.99] text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-md shadow-[#0F2A43]/15 hover:shadow-lg hover:shadow-[#0F2A43]/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Back Link & Security Badge */}
        <div className="mt-6 flex flex-col items-center gap-2.5 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition inline-flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Return to Public Website</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <span>256-bit SSL Protected Management Channel</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}

