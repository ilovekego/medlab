'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users2,
  Search,
  Filter,
  Eye,
  Building2,
  FileSpreadsheet,
  FileCheck,
  Headphones,
  RefreshCw,
  Plus,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { ICustomer } from '@/lib/types';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    try {
      const res = await api.getCustomers();
      if (res.success && Array.isArray(res.data)) {
        setCustomers(res.data);
      } else {
        setCustomers([]);
      }
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.organization.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'All' || c.customerType === typeFilter;
    return matchSearch && matchType;
  });

  const types = ['All', 'Hospital', 'Diagnostic Laboratory', 'Research Institution', 'Clinic', 'Pharmaceutical'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Users2 className="w-6 h-6 text-sky-600" />
            Healthcare Client Directory & CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise database of hospitals, pathology labs, clinics, and academic research institutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCustomers}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-[#163A5C] bg-white dark:bg-[#0A1C2E] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:bg-[#163A5C] transition"
            title="Refresh Customers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-[#0A1C2E] p-4 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by facility, contact doctor, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#163A5C] focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium">Facility Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#163A5C] text-xs bg-white dark:bg-[#0A1C2E] text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-sky-500 outline-none"
          >
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-[#0A1C2E] rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Healthcare Facility</th>
                <th className="px-5 py-3.5">Key Contact / Email</th>
                <th className="px-5 py-3.5">Facility Classification</th>
                <th className="px-5 py-3.5">Territory / Location</th>
                <th className="px-5 py-3.5 text-center">RFQ Enquiries</th>
                <th className="px-5 py-3.5 text-center">Quotations</th>
                <th className="px-5 py-3.5 text-center">Tickets</th>
                <th className="px-5 py-3.5">Last Engagement</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
                    <span>Loading customer accounts...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">No customer records found</p>
                    <p className="text-slate-400 text-xs mt-0.5">Healthcare organizations and clients will be recorded here.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{c.organization}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{c.phone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</div>
                      <a href={`mailto:${c.email}`} className="text-[11px] text-sky-600 hover:underline">
                        {c.email}
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {c.customerType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {c.location}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-sky-700">
                      {c.totalEnquiries || 0}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-amber-700">
                      {c.totalQuotations || 0}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-rose-700">
                      {c.supportTickets || 0}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(c.lastActivity || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/customers/${c._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold transition text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>360° Profile</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Registered Healthcare Facilities: {filtered.length}</span>
          <span>CRM Access Control: Admin &amp; Super Admin</span>
        </div>
      </div>
    </div>
  );
}
