'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Boxes,
  Bot,
  Headphones,
  DollarSign,
  TrendingUp,
  Inbox,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'ai' | 'support'>('sales');
  const [loading, setLoading] = useState(true);

  // Dynamic state
  const [stats, setStats] = useState({
    totalPipelineValue: 0,
    quotationsDispatched: 0,
    averageQuoteValue: 0,
    enquiriesCount: 0,
    conversionRatio: 0,
    totalConversations: 0,
    leadsCaptured: 0,
    openTickets: 0,
    resolvedTickets: 0,
    categories: [] as { name: string; count: number }[],
    pipelineSteps: {
      New: 0,
      Contacted: 0,
      'Quotation Sent': 0,
      Converted: 0,
    },
  });

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const [dashRes, quotesRes, enqRes, convRes, ticketsRes, catRes] = await Promise.all([
          api.getDashboardAnalytics().catch(() => ({ success: false, data: null })),
          api.getQuotations().catch(() => ({ success: false, data: [] })),
          api.getEnquiries().catch(() => ({ success: false, data: [] })),
          api.getConversations().catch(() => ({ success: false, data: [] })),
          api.getSupportTickets().catch(() => ({ success: false, data: [] })),
          api.getCategories().catch(() => ({ success: false, data: [] })),
        ]);

        const quotes = quotesRes.data || [];
        const enquiries = enqRes.data || [];
        const convs = convRes.data || [];
        const tickets = ticketsRes.data || [];
        const cats = catRes.data || [];

        const totalQuoteVal = quotes.reduce((acc: number, q: any) => acc + (q.grandTotal || 0), 0);
        const dispatchedQuotes = quotes.filter((q: any) => q.status === 'Sent' || q.status === 'Accepted' || q.status === 'Approved').length;
        const avgQuote = quotes.length > 0 ? Math.round(totalQuoteVal / quotes.length) : 0;
        const converted = enquiries.filter((e: any) => e.status === 'Converted' || e.status === 'Closed').length;
        const convRate = enquiries.length > 0 ? Math.round((converted / enquiries.length) * 100) : 0;
        const leads = convs.filter((c: any) => c.leadCaptured).length;
        const resolved = tickets.filter((t: any) => t.status === 'Resolved' || t.status === 'Closed').length;
        const open = tickets.filter((t: any) => t.status !== 'Resolved' && t.status !== 'Closed').length;

        const pSteps = {
          New: enquiries.filter((e: any) => e.status === 'New').length,
          Contacted: enquiries.filter((e: any) => e.status === 'Contacted').length,
          'Quotation Sent': enquiries.filter((e: any) => e.status === 'Quotation Sent').length,
          Converted: converted,
        };

        setStats({
          totalPipelineValue: totalQuoteVal,
          quotationsDispatched: dispatchedQuotes,
          averageQuoteValue: avgQuote,
          enquiriesCount: enquiries.length,
          conversionRatio: convRate,
          totalConversations: convs.length,
          leadsCaptured: leads,
          openTickets: open,
          resolvedTickets: resolved,
          categories: cats.map((c: any) => ({ name: c.name, count: c.subcategories?.length || 0 })),
          pipelineSteps: pSteps,
        });
      } catch (err) {
        console.error('Failed to load analytics telemetry:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-sky-600" />
          Enterprise Analytics & Operational Intelligence
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time telemetry across sales pipelines, product catalog demand, AI customer interactions, and biomedical support resolution.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#163A5C] space-x-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'sales' ? 'border-sky-600 text-sky-600' : 'border-transparent hover:text-slate-800 dark:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Sales & Requisitions</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'products' ? 'border-sky-600 text-sky-600' : 'border-transparent hover:text-slate-800 dark:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Product Demand & Catalog</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'ai' ? 'border-sky-600 text-sky-600' : 'border-transparent hover:text-slate-800 dark:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Chatbot Intelligence</span>
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'support' ? 'border-sky-600 text-sky-600' : 'border-transparent hover:text-slate-800 dark:text-slate-200'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Technical Support & SLA</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#0A1C2E] rounded-2xl border border-slate-200 dark:border-[#163A5C] p-12 text-center">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Gathering enterprise analytics telemetry...</p>
        </div>
      ) : (
        <>
          {/* Tab 1: Sales Analytics */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pipeline Value</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">${stats.totalPipelineValue.toLocaleString()}</div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">Live quotations sum</span>
                </div>
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quotations Dispatched</span>
                  <div className="text-2xl font-black text-sky-600 mt-1">{stats.quotationsDispatched}</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Average Quote: ${stats.averageQuoteValue.toLocaleString()}</span>
                </div>
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversion Funnel Ratio</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{stats.conversionRatio}%</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Requisition to Commissioning</span>
                </div>
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enquiries</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">{stats.enquiriesCount}</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Registered in pipeline</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Institutional Sales Funnel Flow</h2>
                {stats.enquiriesCount === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">No sales funnel records logged yet. New enquiries will populate conversion stages here.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>1. New Inquiries / RFQ Intake ({stats.pipelineSteps.New} Facilities)</span>
                        <span className="font-bold">100%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-sky-600 h-full w-full rounded-full" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>2. Contacted Requisitions ({stats.pipelineSteps.Contacted} Facilities)</span>
                        <span className="font-bold">
                          {stats.enquiriesCount > 0 ? Math.round((stats.pipelineSteps.Contacted / stats.enquiriesCount) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{
                            width: `${stats.enquiriesCount > 0 ? Math.round((stats.pipelineSteps.Contacted / stats.enquiriesCount) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>3. Formal Price Quotation Issued ({stats.pipelineSteps['Quotation Sent']} Facilities)</span>
                        <span className="font-bold">
                          {stats.enquiriesCount > 0 ? Math.round((stats.pipelineSteps['Quotation Sent'] / stats.enquiriesCount) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded-full transition-all"
                          style={{
                            width: `${stats.enquiriesCount > 0 ? Math.round((stats.pipelineSteps['Quotation Sent'] / stats.enquiriesCount) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>4. Converted / Commissioned ({stats.pipelineSteps.Converted} Facilities)</span>
                        <span className="font-bold">{stats.conversionRatio}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${stats.conversionRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Products Analytics */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Equipment Sectors in Catalog</h2>
                  {stats.categories.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-medium">No catalog categories loaded.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      {stats.categories.map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div>
                            <strong className="block text-slate-900 dark:text-slate-100">{c.name}</strong>
                            <span className="text-slate-400">{c.count} subcategory specializations</span>
                          </div>
                          <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded">Active</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Requisition Demand Distribution</h2>
                  <div className="py-8 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">Demand distribution updates automatically as customer quotations and inquiries arrive.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: AI Analytics */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Conversations</span>
                  <div className="text-2xl font-black text-sky-600 mt-1">{stats.totalConversations}</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Live assistant interactions</span>
                </div>
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Leads Captured</span>
                  <div className="text-2xl font-black text-teal-600 mt-1">{stats.leadsCaptured}</div>
                  <span className="text-[11px] text-teal-600 font-bold mt-1 block">
                    {stats.totalConversations > 0 ? Math.round((stats.leadsCaptured / stats.totalConversations) * 100) : 0}% Conversion
                  </span>
                </div>
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Support Escalations</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">{stats.openTickets}</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Escalated to engineering</span>
                </div>
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assistant Status</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">Online</div>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 block">100% DB Grounded</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Support Analytics */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Service Tickets</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">{stats.openTickets}</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Pending biomedical action</span>
                </div>
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tickets Resolved</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{stats.resolvedTickets}</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Completed work orders</span>
                </div>
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolution Rate</span>
                  <div className="text-2xl font-black text-sky-600 mt-1">
                    {stats.openTickets + stats.resolvedTickets > 0
                      ? Math.round((stats.resolvedTickets / (stats.openTickets + stats.resolvedTickets)) * 100)
                      : 0}%
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Overall closure ratio</span>
                </div>
                <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SLA Standard</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">&lt; 2hr</div>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 block">Target emergency response</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
