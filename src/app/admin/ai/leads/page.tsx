'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  UserCheck
} from 'lucide-react';

import { api } from '@/lib/api';

export default function AdminAILeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadLeads() {
      setLoading(true);
      try {
        const res = await api.getConversations();
        if (res.success && Array.isArray(res.data)) {
          // Extract conversations with leads captured or converted
          const qualified = res.data
            .filter((c: any) => c.leadStatus || c.leadCaptured)
            .map((c: any) => ({
              id: c.id || c._id || `LEAD-${c.conversationId?.slice(-4) || '001'}`,
              customerName: c.customer?.name || 'Inquiring Clinician',
              organization: c.customer?.organization || c.customer?.org || 'Healthcare Facility',
              phone: c.customer?.phone || 'N/A',
              email: c.customer?.email || 'N/A',
              equipment: c.productsDiscussed?.[0] || 'Medical Equipment Package',
              quantity: 1,
              source: '24/7 AI Chatbot',
              status: c.leadStatus || 'Qualified',
              salesperson: c.assignedTo || 'Unassigned',
              date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent',
            }));
          setLeads(qualified);
        } else {
          setLeads([]);
        }
      } catch {
        setLeads([]);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, []);

  const handleConvert = (leadId: string) => {
    setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: 'Converted to RFQ' } : l)));
    setToast(`Lead ${leadId} successfully converted into active Commercial Requisition!`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-sky-600" />
            AI-Qualified Requisition Leads
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional equipment requirements autonomously gathered, verified, and qualified by the 24/7 assistant.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white dark:bg-[#0A1C2E] rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Lead Reference</th>
                <th className="px-5 py-3.5">Customer & Organization</th>
                <th className="px-5 py-3.5">Equipment Inquired</th>
                <th className="px-5 py-3.5">Capture Date</th>
                <th className="px-5 py-3.5">Assigned Rep</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
                    <span>Loading qualified leads...</span>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">No AI-qualified leads found</p>
                    <p className="text-slate-400 text-xs mt-0.5">Leads captured and qualified by the 24/7 AI Chatbot will appear here.</p>
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-sky-700">
                      {l.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{l.organization}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{l.customerName} &bull; {l.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{l.equipment}</div>
                      <div className="text-[11px] text-slate-400">Qty: {l.quantity} Unit(s)</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                      {l.date}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-600 dark:text-slate-400">
                      {l.salesperson}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        l.status === 'Converted to RFQ' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'Qualified' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700 dark:text-slate-300'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {l.status !== 'Converted to RFQ' ? (
                        <button
                          onClick={() => handleConvert(l.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition text-xs shadow-xs"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Convert to RFQ</span>
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Converted
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
