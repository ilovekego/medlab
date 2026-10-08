'use client';

import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  User,
  Building2,
  RefreshCw,
  Plus,
  Eye,
  Send,
  MessageSquare
} from 'lucide-react';
import { api } from '@/lib/api';
import { ISupportTicket } from '@/lib/types';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<ISupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState<ISupportTicket | null>(null);
  const [resolutionInput, setResolutionInput] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const res = await api.getSupportTickets();
      if (res.success && Array.isArray(res.data)) {
        setTickets(res.data);
        if (res.data.length > 0 && !selectedTicket) {
          setSelectedTicket(res.data[0]);
        }
      } else {
        setTickets([]);
      }
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = (ticketId: string, newStatus: string) => {
    setTickets(tickets.map((t) => (t._id === ticketId ? { ...t, status: newStatus as any } : t)));
    if (selectedTicket && selectedTicket._id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus as any });
    }
    setMsg(`Ticket ${ticketId} status updated to ${newStatus}.`);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleAssignTechnician = (ticketId: string, tech: string) => {
    setTickets(tickets.map((t) => (t._id === ticketId ? { ...t, technician: tech, status: 'Assigned' } : t)));
    if (selectedTicket && selectedTicket._id === ticketId) {
      setSelectedTicket({ ...selectedTicket, technician: tech, status: 'Assigned' });
    }
    setMsg(`Biomedical engineer ${tech} assigned to ticket.`);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !resolutionInput.trim()) return;

    const updated = {
      ...selectedTicket,
      resolutionNotes: resolutionInput,
      status: 'Resolved' as const,
    };
    setTickets(tickets.map((t) => (t._id === selectedTicket._id ? updated : t)));
    setSelectedTicket(updated);
    setResolutionInput('');
    setMsg('Resolution notes logged and ticket marked as Resolved.');
    setTimeout(() => setMsg(null), 3000);
  };

  // KPIs
  const openCount = tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length;
  const criticalCount = tickets.filter((t) => t.priority === 'Critical' && t.status !== 'Resolved').length;
  const assignedCount = tickets.filter((t) => t.technician && t.status !== 'Resolved').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      t.equipment.toLowerCase().includes(search.toLowerCase()) ||
      (t.customer?.organization && t.customer.organization.toLowerCase().includes(search.toLowerCase())) ||
      (t.serialNumber && t.serialNumber.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <span>Biomedical Support &amp; Field Engineering</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed ml-13">
            Real-time tracking of hospital equipment breakdown tickets, field technician dispatch, calibration certifications, and SLA compliance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadTickets}
            className="w-11 h-11 rounded-2xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs cursor-pointer"
            title="Refresh Tickets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* 4 Metric KPI Cards in Curvy Rounded-3xl Containers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Tickets</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{openCount}</div>
          </div>
          <span className="text-xs text-slate-500 mt-2 font-medium">Awaiting field resolution</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Critical Priority</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-rose-600 tracking-tight">{criticalCount}</div>
          </div>
          <span className="text-xs text-rose-600 font-bold mt-2">Target: &lt; 2hr On-Site Response</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Assigned Techs</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{assignedCount}</div>
          </div>
          <span className="text-xs text-slate-500 mt-2 font-medium">Active biomedical dispatches</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Resolved Units</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600 tracking-tight">{resolvedCount}</div>
          </div>
          <span className="text-xs text-emerald-600 font-bold mt-2">100% Certified &amp; Calibrated</span>
        </div>
      </div>

      {/* Filter and Search Bar in Curvy Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Ticket ID, equipment, SN, or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-900 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-semibold bg-slate-50/70 text-slate-700 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-semibold bg-slate-50/70 text-slate-700 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Support Grid: Tickets Table (7 cols) + Live Ticket Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Tickets Table (7 cols) in Curvy Container */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4">Ticket Reference</th>
                  <th className="px-5 py-4">Equipment / Facility</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Technician</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90 text-slate-700 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-600" />
                      <span className="text-xs font-semibold">Synchronizing support tickets...</span>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <Headphones className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="font-bold text-slate-700 text-sm">No support tickets found</p>
                      <p className="text-slate-400 text-xs mt-1">Biomedical breakdown and calibration requests will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const isSelected = selectedTicket?._id === t._id;
                    return (
                      <tr
                        key={t._id}
                        onClick={() => setSelectedTicket(t)}
                        className={`cursor-pointer transition ${isSelected ? 'bg-sky-50/80 font-bold' : 'hover:bg-slate-50/60'}`}
                      >
                        <td className="px-5 py-4 font-mono font-bold text-sky-600 whitespace-nowrap">
                          {t.ticketId}
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">{t.equipment}</div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">{t.customer?.organization || 'Hospital'}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            t.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200/80 font-extrabold' :
                            t.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200/80' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600 truncate max-w-[120px] whitespace-nowrap">
                          {t.technician ? (
                            <span className="font-semibold text-slate-800">{t.technician.split(' ')[0]} {t.technician.split(' ')[1] || ''}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                            t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' :
                            t.status === 'In Progress' ? 'bg-sky-50 text-sky-700 border border-sky-200/80' :
                            t.status === 'Assigned' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white hover:bg-sky-50 text-sky-600 flex items-center justify-center transition shadow-2xs ml-auto cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Ticket Inspector & Resolution Workstation (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          {selectedTicket ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ticket Workstation</span>
                  <h3 className="font-mono text-lg font-black text-slate-900">{selectedTicket.ticketId}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  selectedTicket.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200/80' : 'bg-slate-100 text-slate-700'
                }`}>
                  {selectedTicket.priority} Priority
                </span>
              </div>

              {/* Equipment & Fault Info */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/70 text-xs sm:text-sm space-y-3">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Medical Equipment Unit</span>
                  <strong className="text-slate-900 text-base font-bold block mt-0.5">{selectedTicket.equipment}</strong>
                  <span className="text-xs text-slate-500 font-mono block mt-1">
                    Model: {selectedTicket.model || 'Standard'} &bull; SN: {selectedTicket.serialNumber || 'N/A'}
                  </span>
                </div>

                {selectedTicket.errorCode && (
                  <div className="pt-2 border-t border-slate-200/50">
                    <span className="text-xs text-slate-400 font-semibold block">Diagnostic Error Code</span>
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 text-xs inline-block mt-1">
                      {selectedTicket.errorCode}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200/50">
                  <span className="text-xs text-slate-400 font-semibold block">Reported Fault Description</span>
                  <p className="text-slate-700 text-xs leading-relaxed mt-1 font-medium">{selectedTicket.problem}</p>
                </div>
              </div>

              {/* Facility & Contact */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold block">Healthcare Facility</span>
                <strong className="text-slate-900 text-sm font-bold block">{selectedTicket.customer?.organization || 'Hospital'}</strong>
                <span className="text-slate-600 block text-xs">
                  Contact: {selectedTicket.customer?.name} &bull; {selectedTicket.customer?.phone}
                </span>
              </div>

              {/* Assignment Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">Assigned Field Tech</label>
                  <select
                    value={selectedTicket.technician || 'Unassigned'}
                    onChange={(e) => handleAssignTechnician(selectedTicket._id, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200/80 text-xs font-semibold bg-slate-50/70 text-slate-700 outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="David Miller (Biomedical Eng)">David Miller (Biomedical Eng)</option>
                    <option value="Elena Rostova (Senior Field Eng)">Elena Rostova (Senior Field Eng)</option>
                    <option value="Sarah Jenkins (Clinician Specialist)">Sarah Jenkins (Clinician Specialist)</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">Status Workflow</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket._id, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200/80 text-xs font-bold bg-slate-50/70 text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Customer">Waiting for Customer</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Resolution Notes */}
              {selectedTicket.resolutionNotes && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs">
                  <strong className="text-emerald-900 block mb-1.5 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Biomedical Resolution Notes:
                  </strong>
                  <p className="text-emerald-800 leading-relaxed font-medium">{selectedTicket.resolutionNotes}</p>
                </div>
              )}

              {/* Log Resolution Form */}
              <form onSubmit={handleSaveResolution} className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Log Resolution &amp; Close Ticket
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe parts replaced, calibration check, and post-service electrical safety verification..."
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm shadow-emerald-600/20 cursor-pointer"
                >
                  Mark as Resolved &amp; Issue Certificate
                </button>
              </form>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                <Headphones className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                Select any technical ticket from the table to inspect diagnostic codes, assign technicians, or log biomedical resolutions.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
