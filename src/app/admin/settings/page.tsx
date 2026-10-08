'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings2,
  Save,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Bell,
  Globe,
  SlidersHorizontal,
  AlertTriangle,
  RefreshCw,
  Send,
  Eye,
  Lock,
  Key,
  Database,
  ArrowRight,
  X,
  FileSpreadsheet,
  Headphones,
  Check,
  Layers,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

const defaultSettings = {
  // General & Branding
  siteName: 'Medlab Innovate Engineering Ltd',
  siteTagline: 'Critical Care Systems, Diagnostic Analyzers & Turnkey Biomedical Engineering',
  siteUrl: 'https://medlabinnovate.co.ke',
  timezone: 'Africa/Nairobi',
  currency: 'KES',
  language: 'English',
  seoTitle: 'Medlab Innovate Engineering Ltd | Medical & Laboratory Equipment Solutions Kenya',
  seoDescription: 'ISO 13485 certified critical care devices, hematology & chemistry analyzers, turnkey cleanrooms, and 24/7 biomedical technical support across East Africa.',
  logoUrl: '/images/logo.png',
  faviconUrl: '/favicon.ico',
  announcementBannerEnabled: false,
  announcementBannerText: 'ISO 13485:2016 Certified • 24/7 Critical Care ICU Breakdown Dispatch Hotline Active Across Kenya',
  announcementBannerLink: '/support',

  // Forms & Web3Forms
  web3FormsEnabled: true,
  web3formsContactKey: '79fa7640-9751-435f-b457-383a763867ef',
  web3formsRfqKey: '4ef0b335-2000-43fa-92d0-f58a9298e71a',
  web3formsSupportKey: '22b0db71-765c-45b9-a228-8cfc6e38b434',
  honeypotSpamProtection: true,

  // Notifications & Emails
  notificationEmails: 'admin@medlabinnovate.co.ke, sales@medlabinnovate.co.ke',
  senderName: 'Medlab Engineering Desk',
  senderEmail: 'info@medlabinnovate.co.ke',
  notifyOnNewEnquiry: true,
  notifyOnNewRfq: true,
  notifyOnSupportTicket: true,
  notifyOnChatbotLead: true,
  autoReplyEnabled: true,
  autoReplySubject: '[Medlab Innovate Engineering] Inquiry Logged - Engineering Desk SLA < 4 Hours',
  autoReplyBody: 'Dear {name},\n\nThank you for reaching out to Medlab Innovate Engineering Ltd. Your requisition has been logged with reference ID {enquiryId}.\n\nOur specialized biomedical sales and field engineering desk is reviewing your requirements and will respond within 4 business hours.\n\nFor urgent 24/7 ICU breakdown emergencies, please dial +254 142 808755 immediately.\n\nWarm regards,\nMedlab Engineering Desk\nNairobi, Kenya',

  // Security & Maintenance
  maintenanceMode: false,
  maintenanceMessage: 'Medlab Innovate Engineering Portal is currently undergoing scheduled system calibration. Our 24/7 emergency hotline remains fully active: +254 142 808755.',
  sessionTimeoutHours: 24,
  allowSearchIndexing: true,
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'forms' | 'notifications' | 'maintenance'>('general');
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [testEmailSending, setTestEmailSending] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSiteSettings();
      if (res.success && res.data && Object.keys(res.data).length > 0) {
        setSettings({ ...defaultSettings, ...res.data });
      }
    } catch {
      showToast('Error loading site settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const updateField = (key: keyof typeof defaultSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await api.updateSiteSettings(settings);
      showToast('Website configurations & notification settings saved successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestNotification = () => {
    setTestEmailSending(true);
    setTimeout(() => {
      setTestEmailSending(false);
      showToast(`Test alert successfully simulated to ${settings.notificationEmails}`);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 shadow-xs">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Administration</span>
              <span>•</span>
              <span className="text-sky-600 font-bold">System Control Center</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Website Settings &amp; Configuration Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Control global branding, SEO metadata, form ingestion, notification routing, and maintenance protocols.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleSave()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-sm transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modern Curvy Pill Navigation Tabs Capsule */}
      <div className="p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 inline-flex flex-wrap gap-1.5 shadow-inner">
        {[
          { key: 'general', label: 'General & SEO Branding', icon: Globe },
          { key: 'forms', label: 'Forms & Ingestion Monitoring', icon: FileSpreadsheet },
          { key: 'notifications', label: 'Email Notifications & Routing', icon: Mail },
          { key: 'maintenance', label: 'Security & Maintenance', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 ${
                isActive
                  ? 'bg-white text-sky-600 shadow-sm border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSave} className="space-y-8">
        
        {/* TAB 1: GENERAL & SEO */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Brand Identity &amp; Portal Information</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Core parameters identifying the organization on the public website.</p>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100/60">
                  <Globe className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Site Title</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => updateField('siteName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Domain URL</label>
                  <input
                    type="text"
                    value={settings.siteUrl}
                    onChange={(e) => updateField('siteUrl', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Tagline</label>
                  <input
                    type="text"
                    value={settings.siteTagline}
                    onChange={(e) => updateField('siteTagline', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">System Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  >
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Catalog Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  >
                    <option value="KES">KES - Kenyan Shillings (KSh)</option>
                    <option value="USD">USD - United States Dollars ($)</option>
                    <option value="EUR">EUR - Euros (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEO Metadata Card */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Search Engine Optimization (SEO)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Metadata parsed by Google, Bing, medical indexes, and social share crawlers.</p>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Global Meta Title</label>
                  <input
                    type="text"
                    value={settings.seoTitle}
                    onChange={(e) => updateField('seoTitle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Global Meta Description</label>
                  <textarea
                    rows={3}
                    value={settings.seoDescription}
                    onChange={(e) => updateField('seoDescription', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Header Announcement Banner */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Header Announcement Ribbon</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Display a top banner across the website for emergency notices or accreditations.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcementBannerEnabled}
                    onChange={(e) => updateField('announcementBannerEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>

              {settings.announcementBannerEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Banner Announcement Text</label>
                    <input
                      type="text"
                      value={settings.announcementBannerText}
                      onChange={(e) => updateField('announcementBannerText', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Banner Link Target</label>
                    <input
                      type="text"
                      value={settings.announcementBannerLink}
                      onChange={(e) => updateField('announcementBannerLink', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FORMS & INGESTION MONITOR */}
        {activeTab === 'forms' && (
          <div className="space-y-8">
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Web3Forms Ingestion Keys</h2>
                  <p className="text-xs text-slate-500 mt-0.5">API credentials used to route website submissions directly to your inbox and Firestore database.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ingestion Active
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    General Inquiries &amp; Contact Key (NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={settings.web3formsContactKey}
                      onChange={(e) => updateField('web3formsContactKey', e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Equipment RFQ Requisitions Key (NEXT_PUBLIC_WEB3FORMS_RFQ_ACCESS_KEY)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={settings.web3formsRfqKey}
                      onChange={(e) => updateField('web3formsRfqKey', e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Technical Support Ticket Key (NEXT_PUBLIC_WEB3FORMS_SUPPORT_ACCESS_KEY)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={settings.web3formsSupportKey}
                      onChange={(e) => updateField('web3formsSupportKey', e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Security & Anti-Spam */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Form Verification &amp; Anti-Spam</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Protection mechanisms to ensure clinical and institutional submissions are legitimate.</p>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3.5">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Honeypot Bot Protection</span>
                    <span className="text-xs text-slate-500 block mt-0.5">Silently catches automated submission bots without annoying healthcare clients with captchas.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.honeypotSpamProtection}
                    onChange={(e) => updateField('honeypotSpamProtection', e.target.checked)}
                    className="w-5 h-5 accent-sky-600 rounded-lg cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Save Every Submission to Firestore</span>
                    <span className="text-xs text-slate-500 block mt-0.5">Ensures no inquiry is lost even if email deliverability is temporarily disrupted.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="w-5 h-5 accent-sky-600 rounded-lg cursor-not-allowed opacity-70"
                  />
                </label>
              </div>
            </div>

            {/* Quick Links to Live Form Ingestion */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Link
                href="/admin/enquiries"
                className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-sky-500 hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-600 transition-colors">Enquiries &amp; RFQs</span>
                  <span className="text-xs text-slate-500 mt-1 block">Review all incoming requisitions</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              <Link
                href="/admin/support"
                className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-sky-500 hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-600 transition-colors">Support Tickets</span>
                  <span className="text-xs text-slate-500 mt-1 block">Service and calibration requests</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              <Link
                href="/admin/ai/conversations"
                className="bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-sky-500 hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-600 transition-colors">AI Chat Leads</span>
                  <span className="text-xs text-slate-500 mt-1 block">Chatbot captured requisitions</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-sky-50 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS & EMAIL ROUTING */}
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Administrative Email Alerts Routing</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Designate internal staff emails that receive instant alerts when visitors interact with the website.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  disabled={testEmailSending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs hover:shadow-sm transition shrink-0"
                >
                  <Send className={`w-3.5 h-3.5 ${testEmailSending ? 'animate-pulse text-sky-600' : 'text-slate-500'}`} />
                  <span>{testEmailSending ? 'Sending...' : 'Test Alert Delivery'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Recipient Notification Emails <span className="text-slate-400 font-normal">(Comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={settings.notificationEmails}
                  onChange={(e) => updateField('notificationEmails', e.target.value)}
                  placeholder="admin@medlabinnovate.co.ke, sales@medlabinnovate.co.ke"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition"
                />
              </div>

              <div className="pt-2 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Trigger Conditions</span>

                {[
                  { key: 'notifyOnNewEnquiry', label: 'New General Inquiry / Contact Message Received' },
                  { key: 'notifyOnNewRfq', label: 'New Product RFQ Requisition Submitted' },
                  { key: 'notifyOnSupportTicket', label: 'Emergency or Preventive Support Ticket Opened' },
                  { key: 'notifyOnChatbotLead', label: '24/7 AI Assistant Escalates Qualified Lead' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition">
                    <span className="text-xs font-bold text-slate-700">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={(settings as any)[item.key]}
                      onChange={(e) => updateField(item.key as any, e.target.checked)}
                      className="w-5 h-5 accent-sky-600 rounded-lg cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Customer Auto-Reply Template Card */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Customer Automated Confirmation (Auto-Responder)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Automatically deliver an instant acknowledgement email to healthcare buyers upon form submission.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoReplyEnabled}
                    onChange={(e) => updateField('autoReplyEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>

              {settings.autoReplyEnabled && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Subject Line</label>
                    <input
                      type="text"
                      value={settings.autoReplySubject}
                      onChange={(e) => updateField('autoReplySubject', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Body Template</label>
                      <span className="text-xs text-slate-400 font-mono">Variables: {'{name}'}, {'{enquiryId}'}</span>
                    </div>
                    <textarea
                      rows={6}
                      value={settings.autoReplyBody}
                      onChange={(e) => updateField('autoReplyBody', e.target.value)}
                      className="w-full p-4 font-sans text-xs leading-relaxed rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & MAINTENANCE */}
        {activeTab === 'maintenance' && (
          <div className="space-y-8">
            {/* Maintenance Mode Card */}
            <div className={`p-7 sm:p-8 rounded-3xl border transition-all ${
              settings.maintenanceMode ? 'bg-amber-50/80 border-amber-300 shadow-sm' : 'bg-white border-slate-200/80 shadow-sm'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    settings.maintenanceMode ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Emergency Maintenance Mode</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Temporarily display a maintenance notice to public visitors while preserving admin console access.</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => updateField('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {settings.maintenanceMode && (
                <div className="mt-5 space-y-3">
                  <label className="block text-xs font-bold text-amber-900">Custom Maintenance Screen Message</label>
                  <textarea
                    rows={3}
                    value={settings.maintenanceMessage}
                    onChange={(e) => updateField('maintenanceMessage', e.target.value)}
                    className="w-full p-4 text-xs rounded-2xl border border-amber-200 bg-white text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium"
                  />
                  <span className="text-xs text-amber-700 block font-medium">
                    Notice: Administrators with valid session tokens can still log in and preview all pages normally.
                  </span>
                </div>
              )}
            </div>

            {/* Admin Session Security */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Security Policies &amp; Session Inactivity</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Configure administrative access boundaries and security cookies.</p>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Administrative Session Timeout</label>
                  <select
                    value={settings.sessionTimeoutHours}
                    onChange={(e) => updateField('sessionTimeoutHours', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  >
                    <option value={12}>12 Hours</option>
                    <option value={24}>24 Hours (Standard)</option>
                    <option value={48}>48 Hours</option>
                    <option value={168}>7 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Search Engine Robot Crawling</label>
                  <select
                    value={settings.allowSearchIndexing ? 'true' : 'false'}
                    onChange={(e) => updateField('allowSearchIndexing', e.target.value === 'true')}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  >
                    <option value="true">Allowed (Index public pages, block /admin)</option>
                    <option value="false">Disallow All (noindex, nofollow)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Configuration Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
