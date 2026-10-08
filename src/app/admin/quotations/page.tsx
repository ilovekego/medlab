'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Eye,
  Send,
  Copy,
  Printer,
  CheckCircle2,
  Clock,
  RefreshCw,
  Building2,
  DollarSign,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';
import { IQuotation } from '@/lib/types';
import { useConfirm } from '@/components/ConfirmModal';

export default function AdminQuotationsPage() {
  const { confirm } = useConfirm();
  const [quotations, setQuotations] = useState<IQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadQuotations();
  }, []);

  async function loadQuotations() {
    setLoading(true);
    try {
      const res = await api.getQuotations();
      if (res.success && Array.isArray(res.data)) {
        setQuotations(res.data);
      } else {
        setQuotations([]);
      }
    } catch {
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSendEmail = async (q: IQuotation) => {
    const recipientEmail = q.customer?.email || (q as any).customerEmail || '';
    const clientName = q.customer?.name || (q as any).customerName || 'Procurement Desk';
    const facilityName = q.customer?.organization || (q as any).organization || 'Healthcare Facility';
    const quoteNum = q.quoteNumber || 'MLE-QT';
    const currency = q.currency || 'KES';
    const totalAmount = (q.grandTotal || 0).toLocaleString();
    const validUntilDate = q.validUntil || 'Within 30 Days';

    // Format line items
    const itemsFormatted = (q.items && q.items.length > 0)
      ? q.items.map((it, idx) => 
          `  ${idx + 1}. ${it.name || it.productName || 'Equipment Package'} | Model: ${it.model || 'Standard'} | Qty: ${it.quantity || 1} | Amount: ${currency} ${(it.total || it.unitPrice || 0).toLocaleString()}`
        ).join('\n')
      : '  1. Medical Equipment Package (1 Unit)';

    const emailSubject = `Official Quotation: ${quoteNum} - Medlab Innovate Engineering Ltd`;

    const emailBody = 
`Dear ${clientName},

Thank you for reaching out to Medlab Innovate Engineering Ltd. We are pleased to provide the official commercial quotation for ${facilityName}.

QUOTATION SUMMARY
--------------------------------------------------
Quotation Ref:     ${quoteNum}
Facility / Client: ${facilityName}
Validity:          Valid until ${validUntilDate}
Compliance:        ISO 13485:2016 Certified | Net 30 Commercial SLA

EQUIPMENT CONFIGURATION & PRICING
--------------------------------------------------
${itemsFormatted}

--------------------------------------------------
GRAND TOTAL:       ${currency} ${totalAmount}
--------------------------------------------------

INCLUDED SERVICES & WARRANTIES:
• Comprehensive factory calibration & biomedical compliance documentation
• Certified on-site installation, clinical testing & staff operational training
• 12-month parts & labor warranty with 24/7 technical breakdown support

To approve this proposal, request a proforma invoice, or make technical modifications, please reply directly to this email or contact our biomedical sales desk at +254 142 808755.

Warm regards,

Medlab Innovate Engineering Desk
Turnkey Biomedical Engineering & Medical Systems
Nairobi, Kenya
Email: info@medlabinnovate.co.ke
Website: https://medlabinnovate.co.ke`;

    // Direct Gmail Compose URL with automatic prefill
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open Gmail directly in new tab
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');

    // Update status to 'Sent' in UI
    setQuotations((prev) =>
      prev.map((item) => (item._id === q._id ? { ...item, status: 'Sent' } : item))
    );

    try {
      await api.sendQuotationEmail(q._id);
    } catch {}

    setToastMsg(`Opening Gmail for ${recipientEmail || quoteNum} with pre-filled details...`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDuplicate = (q: IQuotation) => {
    const dup: IQuotation = {
      ...q,
      _id: `q-${Date.now()}`,
      quoteNumber: `MLE-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Draft',
    };
    setQuotations([dup, ...quotations]);
    setToastMsg(`Quotation duplicated as ${dup.quoteNumber} (Draft).`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDelete = async (q: IQuotation) => {
    const ok = await confirm({
      title: 'Delete Quotation',
      message: `Permanently delete quotation "${q.quoteNumber}"? This action cannot be undone.`,
      confirmText: 'Delete Quotation',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await api.deleteQuotation(q._id);
      setQuotations((current) => current.filter((item) => item._id !== q._id));
      setToastMsg(`Quotation ${q.quoteNumber} deleted successfully.`);
    } catch (error) {
      console.error('Failed to delete quotation:', error);
      setToastMsg(`Unable to delete quotation ${q.quoteNumber}. Please try again.`);
    }
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filtered = quotations.filter((q) => {
    const cName = q.customer?.name || q.customerName || '';
    const cOrg = q.customer?.organization || q.organization || '';
    const matchSearch =
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      cName.toLowerCase().includes(search.toLowerCase()) ||
      cOrg.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['All', 'Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired'];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <span>Commercial Quotations &amp; Proposals</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed ml-13">
            Generate formal medical equipment price quotations, compute duties &amp; engineering services, and dispatch certified PDF proposals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadQuotations}
            className="w-11 h-11 rounded-2xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs"
            title="Refresh Quotes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
          <Link
            href="/admin/quotations/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm shadow-sky-600/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create Formal Quotation</span>
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar in Curvy Rounded-3xl Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Quote #, Customer, or Organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-900 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-semibold bg-slate-50/70 text-slate-700 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quotations Table in Curvy Rounded-3xl Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[11px] leading-tight border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4.5">Quote Reference</th>
                <th className="px-6 py-4.5">Healthcare Facility / Client</th>
                <th className="px-6 py-4.5">Equipment Summary</th>
                <th className="px-6 py-4.5">Grand Total (KES)</th>
                <th className="px-6 py-4.5">Valid Until</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
                    <span>Loading commercial quotations...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No quotations found</p>
                    <p className="text-slate-400 text-xs mt-0.5">Commercial proposals and draft quotes will appear here.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4.5 font-mono font-bold text-sky-600 whitespace-nowrap">
                      {q.quoteNumber}
                    </td>
                    <td className="px-6 py-4.5 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{q.customer?.organization || q.organization || 'Facility'}</div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{q.customer?.name || q.customerName} &bull; {q.customer?.email || q.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4.5 max-w-sm">
                      <div className="font-semibold text-slate-800 truncate">
                        {q.items?.[0]?.name || q.items?.[0]?.productName || 'Equipment Package'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {q.items?.length || 1} line item(s) configured
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-mono font-bold text-slate-900 text-sm">
                      {q.currency || 'KES'} {q.grandTotal?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4.5 text-slate-500 font-mono text-xs">
                      {q.validUntil}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        q.status === 'Draft' ? 'bg-slate-100 text-slate-700' :
                        q.status === 'Sent' ? 'bg-sky-50 text-sky-700 border border-sky-200/70' :
                        q.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' :
                        q.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200/70' : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendEmail(q)}
                          className="w-9 h-9 rounded-xl border border-slate-200/70 bg-white hover:bg-sky-50 text-slate-500 hover:text-sky-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                          title="Open in Gmail (Auto-filled Details)"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(q)}
                          className="w-9 h-9 rounded-xl border border-slate-200/70 bg-white hover:bg-teal-50 text-slate-500 hover:text-teal-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                          title="Duplicate Quotation"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q)}
                          className="w-9 h-9 rounded-xl border border-slate-200/70 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                          title="Delete Quotation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Total Quotation Pipeline: <strong className="text-slate-800 font-bold">KES {quotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0).toLocaleString()}</strong></span>
          </div>
          <span className="text-slate-400 text-[11px]">Terms Standard: Net 30 Commercial SLA</span>
        </div>
      </div>
    </div>
  );
}
