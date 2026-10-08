'use client';

import React, { useState } from 'react';
import { Wrench, AlertTriangle, Send, CheckCircle2, Search, ShieldCheck, Phone, Clock, FileCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    organization: '',
    phone: '',
    email: '',
    location: '',
    equipment: '',
    model: '',
    serialNumber: '',
    errorCode: '',
    problem: '',
    description: '',
    priority: 'High',
  });

  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);
  const [error, setError] = useState('');

  // Lookup Ticket
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.createTicket(formData);
      setSubmittedTicket(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to submit support ticket.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const res = await api.getSupportTickets(`?search=${encodeURIComponent(lookupId.trim())}`);
      if (res.data && res.data.length > 0) {
        setLookupResult(res.data[0]);
      } else {
        setLookupError(`No active ticket found matching "${lookupId}". Please verify the Ticket Reference.`);
      }
    } catch (err: any) {
      setLookupError('Error finding ticket.');
    } finally {
      setLookupLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B121E] text-[#10233F] dark:text-slate-100 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10 sm:space-y-12">
        
        {/* Editorial Header */}
        <div className="border-b border-[#E2E8F0] dark:border-slate-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6" data-aos="fade-up">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#1769E0] dark:bg-[#38BDF8]" />
              <span>Biomedical Helpdesk &amp; Emergency Dispatch</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F2A43] dark:text-white tracking-tight">
              Technical Support &amp; Service Dispatch
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-300 mt-2 max-w-2xl font-normal leading-relaxed">
              Report an equipment breakdown, request preventive maintenance servicing, or schedule certified ISO/IEC compliant calibration with on-call biomedical field engineers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-300 shrink-0 p-3 bg-white dark:bg-[#111C2E] rounded-xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0" />
            <span>Priority response for operating theatre &amp; intensive care failures</span>
          </div>
        </div>

        {/* SLA Assurances Quick Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" data-aos="fade-up">
          <div className="p-4 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#162742] text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0F2A43] dark:text-white">&lt; 2-Hour Response</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Critical ICU &amp; OR emergencies</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#162742] text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0F2A43] dark:text-white">IEC 62353 Compliant</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Electrical safety certified</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#162742] text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0F2A43] dark:text-white">NIST Traceable</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Digital calibration certificates</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#162742] text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#0F2A43] dark:text-white">Loaner Device Fleet</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Zero downtime assurance</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Ticket Registration Form (Col 7) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111C2E] p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs space-y-6" data-aos="fade-up">
            <div className="border-b border-[#E2E8F0] dark:border-slate-800 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#0F2A43] dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
                <span>Register Technical Service Ticket</span>
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Tickets are immediately routed to regional on-call biomedical engineering teams.</p>
            </div>

            {submittedTicket ? (
              <div className="p-6 sm:p-8 bg-[#F8FAFC] dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-800/80 rounded-2xl space-y-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto" />
                <h3 className="text-base sm:text-lg font-bold text-[#0F2A43] dark:text-white">Service Ticket Registered</h3>
                <div className="p-3 bg-white dark:bg-[#111C2E] rounded-xl border border-[#E2E8F0] dark:border-slate-700/80 text-xs font-mono font-semibold text-[#1769E0] dark:text-[#38BDF8]">
                  Ticket Reference ID: {submittedTicket.ticketId}
                </div>
                <p className="text-xs text-[#64748B] dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Assigned Priority: <strong className="text-[#0F2A43] dark:text-white">{submittedTicket.priority}</strong>. Our on-call biomedical team has been dispatched. We will contact <strong className="text-[#0F2A43] dark:text-white">{submittedTicket.customer?.phone || 'your phone number'}</strong> directly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedTicket(null)}
                  className="px-5 py-2.5 bg-[#1769E0] hover:bg-[#1258BF] text-white rounded-lg text-xs font-semibold transition shadow-xs"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && <div className="p-3 bg-red-50 dark:bg-rose-950/40 text-red-700 dark:text-rose-300 rounded-lg border border-red-200 dark:border-rose-900/60">{error}</div>}

                {/* Organization & Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Eng. / Nurse / Doctor Name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Hospital / Clinic / Laboratory *</label>
                    <input
                      type="text"
                      required
                      placeholder="Facility Name &amp; Ward"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Phone, Email, Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 700 000 000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="biomedical@hospital.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Department / Ward *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ICU Wing 3rd Floor"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Equipment, Model, Serial, Error Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Equipment Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ICU Ventilator / Hematology Analyzer"
                      value={formData.equipment}
                      onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Model &amp; Serial Number</label>
                    <input
                      type="text"
                      placeholder="e.g. MedVent-9000 (SN: MLE-2024-884)"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Priority & Error Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Priority / Urgency Level *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none font-medium transition-all"
                    >
                      <option value="Critical" className="dark:bg-[#0B1320] dark:text-slate-100">Critical (ICU/OR Down - Immediate Dispatch)</option>
                      <option value="High" className="dark:bg-[#0B1320] dark:text-slate-100">High Priority (&lt; 24hr Turnaround)</option>
                      <option value="Medium" className="dark:bg-[#0B1320] dark:text-slate-100">Medium Priority (Routine Maintenance)</option>
                      <option value="Low" className="dark:bg-[#0B1320] dark:text-slate-100">Low / Calibration Scheduling</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Error Code (If Displayed)</label>
                    <input
                      type="text"
                      placeholder="e.g. ERR-FLOW-04 / E-12"
                      value={formData.errorCode}
                      onChange={(e) => setFormData({ ...formData, errorCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Problem & Description */}
                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Summary of Problem *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Expiratory valve sensor alarm on system boot"
                    value={formData.problem}
                    onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Detailed Symptoms &amp; Environment *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe failure behavior, clinical impact, and any pre-check troubleshooting performed..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1769E0] hover:bg-[#1258BF] text-white font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm transition-all disabled:opacity-50"
                >
                  {loading ? 'Dispatching Ticket...' : 'Dispatch Technical Service Ticket'}
                </button>
              </form>
            )}
          </div>

          {/* Status Lookup & Emergency Helpline (Col 5) */}
          <div className="lg:col-span-5 space-y-6" data-aos="fade-up">
            
            {/* Ticket Status Tracker */}
            <div className="bg-white dark:bg-[#111C2E] p-6 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#0F2A43] dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
                <span>Track Existing Service Ticket</span>
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400">Enter your official Ticket Reference (e.g. MLE-SRV-2026-XXXX):</p>

              <form onSubmit={handleLookup} className="flex gap-2">
                <input
                  type="text"
                  placeholder="MLE-SRV-..."
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50/60 dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-xl text-[#10233F] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="px-4 py-2 bg-[#1769E0] hover:bg-[#1258BF] text-white font-semibold rounded-xl text-xs transition shadow-xs"
                >
                  {lookupLoading ? 'Checking...' : 'Lookup'}
                </button>
              </form>

              {lookupError && <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">{lookupError}</div>}

              {lookupResult && (
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-800/80 rounded-xl text-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-slate-800">
                    <span className="text-[#64748B] dark:text-slate-400">Ticket ID:</span> 
                    <strong className="font-mono text-[#0F2A43] dark:text-white">{lookupResult.ticketId}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Equipment:</span> 
                    <strong className="text-[#0F2A43] dark:text-slate-100">{lookupResult.equipment}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Status:</span> 
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F0F6FE] dark:bg-[#162742] text-[#1769E0] dark:text-[#38BDF8] border border-[#E0EDFD] dark:border-slate-700/80">
                      {lookupResult.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] dark:text-slate-400">Priority:</span> 
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-[#16233B] text-[#0F2A43] dark:text-slate-200 border border-[#E2E8F0] dark:border-slate-700/80">
                      {lookupResult.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[#64748B] dark:text-slate-400">Assigned Unit:</span> 
                    <span className="text-[#0F2A43] dark:text-slate-100 font-medium">{lookupResult.assignedTechnician?.name || 'On-Call Mobile Squad'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency ICU/OR Hotline Box */}
            <div className="p-6 bg-gradient-to-br from-rose-50/70 to-white dark:from-[#171A27] dark:to-[#111824] border border-rose-200 dark:border-rose-500/30 rounded-2xl space-y-4 text-xs shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Critical ICU &amp; Theatre Emergency Line</span>
              </div>
              <p className="text-[#475569] dark:text-slate-300 leading-relaxed font-normal">
                If an intensive care ventilator, patient monitor, or electrosurgical generator fails during an acute clinical procedure, dial our 24/7 dedicated engineering emergency line immediately:
              </p>
              <div className="space-y-2.5">
                <a 
                  href="tel:+254142808755" 
                  className="block p-3.5 bg-white dark:bg-[#1E2538] hover:bg-rose-50/50 dark:hover:bg-[#252E46] rounded-xl border border-rose-200 dark:border-rose-500/30 text-center font-bold text-sm text-[#0F2A43] dark:text-rose-300 transition shadow-xs"
                >
                  📞 Telephone: +254 142 808755
                </a>
                <a 
                  href="https://wa.me/254745662988"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="p-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl text-center font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>WhatsApp Dispatch: +254 745 662 988</span>
                </a>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 text-center">
                Mobile biomedical emergency vans carry universal replacement modules.
              </p>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
