'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Send,
  Building2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Plus,
  Pin
} from 'lucide-react';
import { api } from '@/lib/api';
import { IEnquiry } from '@/lib/types';

function EnquiriesPageSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse" aria-label="Loading enquiries" role="status">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-[32rem] max-w-full rounded-lg bg-slate-200" />
          <div className="h-4 w-[38rem] max-w-full rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200" />
          <div className="h-10 w-48 rounded-xl bg-slate-200" />
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0A1C2E] border border-slate-200 dark:border-[#163A5C] shadow-xs flex gap-4">
        <div className="h-10 flex-1 rounded-xl bg-slate-100" />
        <div className="h-10 w-44 rounded-xl bg-slate-100" />
      </div>
      <div className="bg-white dark:bg-[#0A1C2E] rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs overflow-hidden">
        <div className="h-14 bg-slate-100 border-b border-slate-200 dark:border-[#163A5C]" />
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-5 px-5 py-5 min-w-[1050px]">
              <div className="w-28 h-4 rounded bg-slate-200" />
              <div className="w-52 space-y-2">
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="h-3 w-48 rounded bg-slate-100" />
              </div>
              <div className="w-60 space-y-2">
                <div className="h-4 w-52 rounded bg-slate-200" />
                <div className="h-3 w-32 rounded bg-slate-100" />
              </div>
              <div className="w-20 h-4 rounded bg-slate-100" />
              <div className="w-24 h-7 rounded-full bg-slate-100" />
              <div className="w-20 h-4 rounded bg-slate-100" />
              <div className="w-20 h-7 rounded-full bg-slate-100" />
              <div className="ml-auto w-20 h-8 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading requisitions...</span>
    </div>
  );
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<IEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function loadEnquiries() {
    setLoading(true);
    try {
      const res = await api.getEnquiries();
      if (res.success && Array.isArray(res.data)) {
        setEnquiries(res.data);
      } else {
        setEnquiries([]);
      }
    } catch {
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = enquiries
    .filter((e) => {
    const matchSearch =
      e.enquiryId.toLowerCase().includes(search.toLowerCase()) ||
      e.customerName.toLowerCase().includes(search.toLowerCase()) ||
      e.organization.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const statuses = ['All', 'New', 'Contacted', 'Quotation Sent', 'Follow-up', 'Converted', 'Closed'];

  const handleTogglePin = async (enquiry: IEnquiry) => {
    const isPinned = !enquiry.isPinned;
    setEnquiries((current) =>
      current.map((item) => (item._id === enquiry._id ? { ...item, isPinned } : item))
    );

    try {
      await api.updateEnquiry(enquiry._id, { isPinned });
      setActionMessage(isPinned ? 'Enquiry pinned to the top.' : 'Enquiry unpinned.');
    } catch (error) {
      setEnquiries((current) =>
        current.map((item) => (item._id === enquiry._id ? { ...item, isPinned: enquiry.isPinned } : item))
      );
      console.error('Failed to update enquiry pin:', error);
      setActionMessage('Unable to update enquiry pin. Please try again.');
    } finally {
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  if (loading) {
    return <EnquiriesPageSkeleton />;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span>Equipment Requisitions &amp; RFQ Enquiries</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed ml-13">
            Track incoming institutional medical equipment requests from website forms and 24/7 AI chatbot leads.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadEnquiries}
            className="w-11 h-11 rounded-2xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs"
            title="Refresh Enquiries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
          <Link
            href="/admin/quotations/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm shadow-sky-600/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Draft New Quotation</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold flex items-center gap-2.5 shadow-2xs">
          <Pin className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar in Curvy Rounded-3xl Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative w-full lg:max-w-xl flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, hospital, doctor, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-900 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center justify-end gap-3 w-full lg:w-auto">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Pipeline Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[180px] px-4 py-3 rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-semibold bg-slate-50/70 text-slate-700 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requisitions Table in Curvy Rounded-3xl Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[11px] leading-tight border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4.5 min-w-[170px]">Enquiry ID</th>
                <th className="px-6 py-4.5 min-w-[240px]">Customer &amp; Organization</th>
                <th className="px-6 py-4.5 min-w-[280px]">Equipment Requisition</th>
                <th className="px-6 py-4.5 min-w-[120px]">Location</th>
                <th className="px-6 py-4.5 min-w-[160px]">Source</th>
                <th className="px-6 py-4.5 min-w-[120px]">Sales Rep</th>
                <th className="px-6 py-4.5 min-w-[120px]">Status</th>
                <th className="px-6 py-4.5 min-w-[140px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
                    <span>Loading requisitions...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No requisitions or RFQs found</p>
                    <p className="text-slate-400 text-xs mt-0.5">Incoming RFQ enquiries will appear here in real time.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((enq) => {
                  const totalQty = enq.items?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 1;
                  return (
                    <tr key={enq._id} className={`transition ${enq.isPinned ? 'bg-amber-50/40 hover:bg-amber-50/60' : 'hover:bg-slate-50/70'}`}>
                      <td className="px-6 py-4.5 align-middle font-mono font-bold text-sky-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {enq.isPinned && <Pin className="w-3.5 h-3.5 text-amber-600 fill-current shrink-0" aria-label="Pinned enquiry" />}
                          <span>{enq.enquiryId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 align-middle max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{enq.organization}</div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">{enq.customerName} &bull; {enq.email}</div>
                      </td>
                      <td className="px-6 py-4.5 align-middle max-w-sm">
                        <div className="font-semibold text-slate-800 truncate">
                          {enq.items?.[0]?.productName || 'Medical Equipment Package'}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Qty: {totalQty} unit(s) &bull; {enq.items?.length || 1} item line(s)
                        </div>
                      </td>
                      <td className="px-6 py-4.5 align-middle text-slate-600">
                        {enq.location || 'Global'}
                      </td>
                      <td className="px-6 py-4.5 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          enq.source?.toLowerCase() === 'chatbot' ? 'bg-teal-50 text-teal-700 border border-teal-200/70' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {enq.source?.toLowerCase() === 'chatbot' && <Sparkles className="w-3 h-3 text-teal-600" />}
                          <span className="whitespace-nowrap">{enq.source || 'Website RFQ'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4.5 align-middle text-xs text-slate-600">
                        {enq.assignedTo || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4.5 align-middle">
                        <span className={`inline-flex px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          enq.status === 'New' ? 'bg-sky-50 text-sky-700 border border-sky-200/70' :
                          enq.status === 'Contacted' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70' :
                          enq.status === 'Quotation Sent' ? 'bg-amber-50 text-amber-700 border border-amber-200/70' :
                          enq.status === 'Converted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePin(enq)}
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition shadow-2xs cursor-pointer ${
                              enq.isPinned
                                ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100'
                                : 'border-slate-200/70 bg-white text-slate-400 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600'
                            }`}
                            title={enq.isPinned ? 'Unpin enquiry' : 'Pin enquiry to top'}
                            aria-label={enq.isPinned ? 'Unpin enquiry' : 'Pin enquiry to top'}
                          >
                            <Pin className={`w-3.5 h-3.5 ${enq.isPinned ? 'fill-current' : ''}`} />
                          </button>
                          <Link
                            href={`/admin/enquiries/${enq._id}`}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200/70 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 font-semibold transition shadow-2xs inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Showing <strong className="text-slate-800 font-bold">{filtered.length}</strong> active healthcare requisitions</span>
          </div>
          <span className="text-slate-400 text-[11px]">Lead SLA Target: &lt; 4 Hours</span>
        </div>
      </div>
    </div>
  );
}
