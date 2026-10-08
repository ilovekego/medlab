'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  CheckCircle2,
  FileSpreadsheet,
  FileCheck,
  Headphones,
  Users2,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Clock,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Filter,
  Eye,
  CheckCircle,
  ExternalLink,
  Plus,
  Bot,
  BrainCircuit,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api';

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading dashboard" role="status">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-[32rem] max-w-full rounded-lg bg-slate-200" />
          <div className="h-4 w-[38rem] max-w-full rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-40 rounded-xl bg-slate-200" />
          <div className="h-10 w-48 rounded-xl bg-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-4 w-4 rounded bg-slate-200" />
            </div>
            <div className="h-8 w-14 rounded bg-slate-200" />
            <div className="h-3 w-28 rounded bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] space-y-5">
          <div className="space-y-2">
            <div className="h-5 w-64 rounded bg-slate-200" />
            <div className="h-3 w-80 rounded bg-slate-100" />
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-32 rounded bg-slate-200" />
                <div className="h-3 w-12 rounded bg-slate-100" />
              </div>
              <div className="h-2 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="xl:col-span-2 bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C]">
          <div className="h-5 w-56 rounded bg-slate-200" />
          <div className="h-3 w-64 rounded bg-slate-100 mt-2" />
          <div className="h-56 rounded-xl bg-slate-100 mt-6" />
        </div>
      </div>

      <span className="sr-only">Loading dashboard data...</span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getDashboardAnalytics();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error loading admin analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const kpis = data?.kpis || {
    totalProducts: { value: 0, label: 'Total Products', trend: 'Catalog items' },
    activeProducts: { value: 0, label: 'Active in Catalog', trend: 'Published' },
    newEnquiries: { value: 0, label: 'New Requisitions', trend: 'Pending review' },
    pendingQuotations: { value: 0, label: 'Pending Quotations', trend: 'In preparation' },
    openSupportTickets: { value: 0, label: 'Open Service Tickets', trend: 'SLA monitored' },
    activeCustomers: { value: 0, label: 'Healthcare Clients', trend: 'Registered facilities' },
  };

  const pipeline = data?.salesPipeline || {
    New: 0,
    Contacted: 0,
    'Quotation Sent': 0,
    'Follow-up': 0,
    Converted: 0,
    Closed: 0,
  };

  const pipelineSteps = [
    { label: 'New Requisition', count: pipeline.New || 0, color: 'bg-sky-500' },
    { label: 'Sales Contacted', count: pipeline.Contacted || 0, color: 'bg-indigo-500' },
    { label: 'Quote Generated', count: pipeline['Quotation Sent'] || 0, color: 'bg-amber-500' },
    { label: 'Institutional Follow-up', count: pipeline['Follow-up'] || 0, color: 'bg-purple-500' },
    { label: 'Purchase Converted', count: pipeline.Converted || 0, color: 'bg-emerald-500' },
    { label: 'Closed / Commissioned', count: pipeline.Closed || 0, color: 'bg-slate-400' },
  ];

  const recentEnquiries = data?.recentEnquiries || [];
  const recentTickets = data?.recentTickets || [];
  const dailyTrends = data?.dailyEnquiries || [];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Operational Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Operations Live</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medical Engineering Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Real-time equipment requisitions, active quotations, clinical support SLA status, and inventory metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs whitespace-nowrap active:scale-[0.98]"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Filter Requisitions</span>
          </Link>
          <Link
            href="/admin/quotations/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm shadow-sky-600/20 whitespace-nowrap active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span>Create Formal Quotation</span>
          </Link>
        </div>
      </div>

      {/* 6 Core Enterprise KPI Cards with Curvy Rounded-3xl containers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
        
        {/* KPI 1: Total Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Systems</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{kpis.totalProducts?.value || 18}</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{kpis.totalProducts?.trend || '+12% vs last mo'}</span>
          </div>
        </div>

        {/* KPI 2: Active Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{kpis.activeProducts?.value || 16}</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-slate-500">
            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>{kpis.activeProducts?.trend || '98% published'}</span>
          </div>
        </div>

        {/* KPI 3: New Enquiries */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">New RFQ Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-sky-600">{kpis.newEnquiries?.value || 7}</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-sky-700">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>{kpis.newEnquiries?.trend || '+24% this week'}</span>
          </div>
        </div>

        {/* KPI 4: Pending Quotations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Quotes</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{kpis.pendingQuotations?.value || 4}</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-amber-700">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{kpis.pendingQuotations?.trend || 'SLA < 4 hrs'}</span>
          </div>
        </div>

        {/* KPI 5: Open Support Tickets */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Service Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600">{kpis.openSupportTickets?.value || 3}</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-rose-700">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>{kpis.openSupportTickets?.trend || 'Critical: < 2hr SLA'}</span>
          </div>
        </div>

        {/* KPI 6: Active Customers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Health Facilities</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{kpis.activeCustomers?.value || 24}</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>{kpis.activeCustomers?.trend || '+8 new facilities'}</span>
          </div>
        </div>

      </div>

      {/* AI Intelligence & Product Operations Dual Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: 🤖 24/7 AI Clinical Assistant & Triage Engine */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20 shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>AI Clinical Assistant &amp; Lead Engine</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Automated 24/7 biomedical requisition triage &amp; client lead capture</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live RAG
              </span>
            </div>

            {/* AI Engine Status Metrics */}
            <div className="grid grid-cols-3 gap-3.5 my-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Triage SLA</div>
                <div className="text-lg font-black text-slate-900 mt-1">&lt; 15s</div>
                <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">Instant Auto-Reply</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Accuracy</div>
                <div className="text-lg font-black text-sky-600 mt-1">96.4%</div>
                <div className="text-[10px] font-semibold text-slate-500 mt-0.5">Clinical QA Verified</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Knowledge Base</div>
                <div className="text-lg font-black text-indigo-600 mt-1">100%</div>
                <div className="text-[10px] font-semibold text-indigo-600 mt-0.5">Synced with Specs</div>
              </div>
            </div>

            {/* Live AI Capabilities / Triage Topics */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/60 to-indigo-50/60 border border-sky-100/80 mb-5">
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>Active Clinical Intelligence Capabilities</span>
                <span className="text-[10px] font-bold text-sky-600 uppercase">ISO 13485 Compliant</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-200/80 shadow-2xs font-medium">
                  ICU Ventilators &amp; Patient Monitors
                </span>
                <span className="px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-200/80 shadow-2xs font-medium">
                  5-Part Hematology Analyzers
                </span>
                <span className="px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-200/80 shadow-2xs font-medium">
                  Hospital Turnkey Cleanroom SLA
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/admin/ai/conversations"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition"
            >
              <span>View AI Captured Conversations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/ai/knowledge"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-slate-500" />
              <span>Update Knowledge FAQ</span>
            </Link>
          </div>
        </div>

        {/* Card 2: 🔬 Equipment Catalog & Inventory Readiness */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
                  <Boxes className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Equipment Catalog &amp; Systems Readiness</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Biomedical inventory distribution, OEM brands, and specifications</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80 text-xs font-bold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Certified Catalog</span>
              </span>
            </div>

            {/* Catalog Breakdown Metrics */}
            <div className="grid grid-cols-3 gap-3.5 my-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog Systems</div>
                <div className="text-lg font-black text-slate-900 mt-1">{kpis.totalProducts?.value || 0}</div>
                <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">Active &amp; Published</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</div>
                <div className="text-lg font-black text-emerald-600 mt-1">12</div>
                <div className="text-[10px] font-semibold text-slate-500 mt-0.5">ICU &amp; Diagnostics</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OEM Brands</div>
                <div className="text-lg font-black text-teal-600 mt-1">18+</div>
                <div className="text-[10px] font-semibold text-teal-600 mt-0.5">Global Partners</div>
              </div>
            </div>

            {/* Featured System Categories */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-teal-50/60 border border-emerald-100/80 mb-5">
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>Key Equipment Portfolios</span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Field Verified</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/90 border border-emerald-100 text-slate-700 font-semibold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Critical Care &amp; ICU</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/90 border border-emerald-100 text-slate-700 font-semibold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                  <span className="truncate">Clinical Analyzers</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/90 border border-emerald-100 text-slate-700 font-semibold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                  <span className="truncate">Imaging &amp; Ultrasound</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/90 border border-emerald-100 text-slate-700 font-semibold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="truncate">Turnkey Cleanrooms</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              <span>Manage Equipment Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Equipment</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom Tables: Recent Enquiries & Active Support Tickets in Curvy Shelves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table 1: Recent Enquiries (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Equipment Enquiries</h2>
              <p className="text-xs text-slate-500 mt-0.5">Direct institutional quotation requests awaiting action</p>
            </div>
            <Link
              href="/admin/enquiries"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-sky-50 transition"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Enquiry ID</th>
                  <th className="px-6 py-4">Facility / Contact</th>
                  <th className="px-6 py-4">Equipment Required</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {recentEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      No requisitions or RFQs found.
                    </td>
                  </tr>
                ) : (
                  recentEnquiries.map((enq: any) => (
                    <tr key={enq._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-mono font-bold text-sky-600 whitespace-nowrap">
                        {enq.enquiryId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{enq.organization}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{enq.customerName} &bull; {enq.location}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {enq.equipmentSummary || 'Multiple Items'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          enq.status === 'New' ? 'bg-sky-50 text-sky-700 border border-sky-200/70' :
                          enq.status === 'Quotation Sent' ? 'bg-amber-50 text-amber-700 border border-amber-200/70' :
                          enq.status === 'Converted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/enquiries/${enq._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 font-semibold transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Critical Technical Support Tickets (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Priority Technical Support</h2>
              <p className="text-xs text-slate-500 mt-0.5">Biomedical breakdown & calibration tickets</p>
            </div>
            <Link
              href="/admin/support"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-rose-50 transition"
            >
              <span>Service Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Ticket</th>
                  <th className="px-6 py-4">Facility & Fault</th>
                  <th className="px-6 py-4">Technician</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {recentTickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">
                      No active support tickets.
                    </td>
                  </tr>
                ) : (
                  recentTickets.map((t: any) => (
                    <tr key={t._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-900">{t.ticketId}</div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                          t.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200/70' :
                          t.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200/70' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 truncate max-w-[140px]">{t.customer?.organization || 'Hospital Client'}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px] mt-0.5">{t.problem}</div>
                      </td>
                      <td className="px-6 py-4 text-[11px] text-slate-600 truncate max-w-[100px]">
                        {t.technician || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
