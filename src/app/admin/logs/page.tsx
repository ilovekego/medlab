'use client';

import React, { useState } from 'react';
import {
  Clock,
  Search
} from 'lucide-react';

import { api } from '@/lib/api';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const getText = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const getDate = (value: any): Date | null => {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getUserLabel = (log: any): string => {
    const user = getText(log.user || log.userName);
    return user.includes('Super Admin') ? 'Super Admin' : user || 'System';
  };

  React.useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await api.getActivityLogs();
        if (res.success && Array.isArray(res.data)) {
          setLogs(res.data);
        } else {
          setLogs([]);
          setError(res.message || 'Unable to load activity logs.');
        }
      } catch (err: any) {
        setLogs([]);
        setError(err?.message || 'Unable to load activity logs.');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      getUserLabel(l).toLowerCase().includes(search.toLowerCase()) ||
      getText(l.action).toLowerCase().includes(search.toLowerCase()) ||
      getText(l.entityId).toLowerCase().includes(search.toLowerCase()) ||
      getText(l.details || l.description).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <span>Regulatory Activity &amp; Audit Trail</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed ml-13">
          Immutable audit log tracking all administrative interventions, quotation dispatches, and support tickets in compliance with FDA 21 CFR Part 11 and ISO 13485.
        </p>
      </div>

      {/* Search Bar in Curvy Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by user, action code, or reference ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-900 placeholder-slate-400 font-medium"
          />
        </div>

        <span className="text-xs text-slate-500 font-bold bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80">
          Showing {filtered.length} logged events
        </span>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-2xs">
          {error}
        </div>
      )}

      {/* Audit Log Table in Curvy Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Action Code</th>
                <th className="px-6 py-4">Entity Reference</th>
                <th className="px-6 py-4">Detailed Audit Trail</th>
                <th className="px-6 py-4 text-right">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/90 text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-600" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-700 text-sm">No activity logs recorded yet</p>
                    <p className="text-slate-400 text-xs mt-1">Platform actions and regulatory audit events will be logged here.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l._id || l.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4.5 font-mono text-slate-500 text-xs whitespace-nowrap">
                      {getDate(l.createdAt || l.timestamp)?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4.5 font-bold text-slate-900 whitespace-nowrap">
                      {getUserLabel(l)}
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 font-mono font-bold text-sky-600 whitespace-nowrap">
                      {l.entityId || 'N/A'}
                    </td>
                    <td className="px-6 py-4.5 text-slate-600 text-xs max-w-md leading-relaxed">
                      {getText(l.details || l.description) || 'N/A'}
                    </td>
                    <td className="px-6 py-4.5 text-right font-mono text-xs text-slate-400 whitespace-nowrap">
                      {l.ipAddress || l.ip || 'N/A'}
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
