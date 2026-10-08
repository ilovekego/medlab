'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users2,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileSpreadsheet,
  FileCheck,
  Headphones,
  Clock,
  Eye,
  Plus,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomer() {
      setLoading(true);
      try {
        const res = await api.getCustomerById(id);
        if (res.success && res.data) {
          setCustomer(res.data.customer || res.data);
          setEnquiries(res.data.enquiries || []);
          setQuotations(res.data.quotations || []);
          setTickets(res.data.tickets || []);
        } else {
          setCustomer(null);
        }
      } catch {
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadCustomer();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-600" />
        <span className="font-semibold text-sm">Loading Customer Profile...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <Users2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Customer Not Found</h2>
        <p className="text-slate-500 text-sm">The requested customer record could not be found or does not exist.</p>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Directory</span>
        </Link>
      </div>
    );
  }

  const lifetimeSpend = quotations
    .filter((q) => q.status === 'Accepted' || q.status === 'Paid')
    .reduce((acc, curr) => acc + (curr.total || curr.grandTotal || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customer Directory</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-sky-600" />
              {customer.organization || customer.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Key Liaison: <strong>{customer.name}</strong> &bull; Sector: {customer.customerType || 'Healthcare'} &bull; {customer.location || 'Global'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/quotations/new?customer=${encodeURIComponent(customer.name || '')}&org=${encodeURIComponent(customer.organization || '')}&email=${encodeURIComponent(customer.email || '')}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Draft New Quote</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Contact Profile Header Card */}
      <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-[#163A5C] rounded-xl">
          <span className="text-slate-400 font-semibold block mb-1">Primary Email</span>
          {customer.email ? (
            <a href={`mailto:${customer.email}`} className="text-sky-600 font-medium hover:underline block truncate">
              {customer.email}
            </a>
          ) : (
            <span className="text-slate-400">Not provided</span>
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-[#163A5C] rounded-xl">
          <span className="text-slate-400 font-semibold block mb-1">Direct Phone</span>
          {customer.phone ? (
            <a href={`tel:${customer.phone}`} className="text-slate-900 dark:text-slate-100 font-mono font-medium hover:underline block">
              {customer.phone}
            </a>
          ) : (
            <span className="text-slate-400">Not provided</span>
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-[#163A5C] rounded-xl">
          <span className="text-slate-400 font-semibold block mb-1">Facility Classification</span>
          <strong className="text-slate-900 dark:text-slate-100 block">{customer.customerType || 'Standard'}</strong>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-[#163A5C] rounded-xl">
          <span className="text-slate-400 font-semibold block mb-1">Total Lifetime Spend</span>
          <strong className="text-emerald-700 font-mono text-sm block">
            ${lifetimeSpend.toLocaleString()} USD
          </strong>
        </div>
      </div>

      {/* 360 Tabs / Sections */}
      <div className="space-y-6">
        
        {/* 1. Requisitions History */}
        <div className="bg-white dark:bg-[#0A1C2E] rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              Requisitions / RFQ History ({enquiries.length})
            </h2>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#163A5C] text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Enquiry Reference</th>
                <th className="px-5 py-3">Equipment Required</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:text-slate-300">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No requisition history found for this facility.
                  </td>
                </tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50 dark:bg-[#163A5C]">
                    <td className="px-5 py-3 font-mono font-bold text-sky-700">{e.enquiryId}</td>
                    <td className="px-5 py-3 text-slate-900 dark:text-slate-100">{e.equipmentSummary || e.items?.[0]?.productName || 'Equipment Requisition'}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(e.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 uppercase">
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/enquiries/${e._id}`} className="text-sky-600 font-bold hover:underline">
                        View Dossier &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 2. Quotations History */}
        <div className="bg-white dark:bg-[#0A1C2E] rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-600" />
              Commercial Quotations & Proposals ({quotations.length})
            </h2>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#163A5C] text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Quote Number</th>
                <th className="px-5 py-3">Total Amount</th>
                <th className="px-5 py-3">Valid Until</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:text-slate-300">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No quotations generated yet for this facility.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50 dark:bg-[#163A5C]">
                    <td className="px-5 py-3 font-mono font-bold text-sky-700">{q.quoteNumber}</td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">${(q.grandTotal || q.total || 0).toLocaleString()} USD</td>
                    <td className="px-5 py-3 text-slate-500">{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {q.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href="/admin/quotations" className="text-sky-600 font-bold hover:underline">
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Technical Support Tickets */}
        <div className="bg-white dark:bg-[#0A1C2E] rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-rose-600" />
              Biomedical Support & Maintenance Tickets ({tickets.length})
            </h2>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#163A5C] text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-5 py-3">Ticket ID</th>
                <th className="px-5 py-3">Equipment Unit</th>
                <th className="px-5 py-3">Reported Fault / Request</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:text-slate-300">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No support tickets reported for this facility.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:bg-[#163A5C]">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">{t.ticketId}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">{t.equipment}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{t.problem || t.description}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
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
  );
}
