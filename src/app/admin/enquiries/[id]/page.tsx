'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  FileCheck,
  Send,
  Plus,
  ShieldCheck,
  Wrench,
  GraduationCap,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { IEnquiry } from '@/lib/types';

export default function AdminEnquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [enquiry, setEnquiry] = useState<IEnquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('New');
  const [assignedTo, setAssignedTo] = useState('Sarah Jenkins (Sales Mgr)');
  const [newNote, setNewNote] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getEnquiryById(id);
        if (res.success && res.data) {
          setEnquiry(res.data);
          setStatus(res.data.status);
          if (res.data.assignedTo) setAssignedTo(res.data.assignedTo);
        } else {
          setEnquiry(null);
        }
      } catch {
        setEnquiry(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async (newStat: any) => {
    setStatus(newStat);
    if (!enquiry) return;
    const updatedTimeline = [
      ...(enquiry.timeline || []),
      { event: `Status updated to ${newStat}`, description: `Pipeline status modified to ${newStat}`, timestamp: new Date().toISOString() },
    ];
    setEnquiry({ ...enquiry, status: newStat, timeline: updatedTimeline });
    setToastMsg(`Pipeline status updated to ${newStat}.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !enquiry) return;

    const entry = {
      status,
      note: newNote,
      timestamp: new Date().toISOString(),
    };
    const updated = {
      ...enquiry,
      timeline: [...(enquiry.timeline || []), entry],
    };
    setEnquiry(updated);
    setNewNote('');
    setToastMsg('Operational note logged to activity audit timeline.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-semibold">Loading Requisition Dossier...</div>;
  }

  if (!enquiry) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Requisition Not Found</h2>
        <p className="text-slate-500 text-sm">The requested enquiry could not be found or does not exist.</p>
        <Link
          href="/admin/enquiries"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requisitions</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Requisitions</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Requisition {enquiry.enquiryId}
            </h1>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              status === 'New' ? 'bg-sky-100 text-sky-800' :
              status === 'Contacted' ? 'bg-indigo-100 text-indigo-800' :
              status === 'Quotation Sent' ? 'bg-amber-100 text-amber-800' :
              status === 'Converted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700 dark:text-slate-300'
            }`}>
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submitted on {new Date(enquiry.createdAt || Date.now()).toLocaleDateString()} &bull; Source: <strong>{enquiry.source || 'Website RFQ'}</strong>
          </p>
        </div>

        {/* Primary Action Button: Create Quotation */}
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/quotations/new?enquiryId=${enquiry._id}&customer=${encodeURIComponent(enquiry.customerName)}&org=${encodeURIComponent(enquiry.organization)}&email=${encodeURIComponent(enquiry.emailAddress || '')}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
          >
            <FileCheck className="w-4 h-4" />
            <span>Create Official Quotation</span>
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Grid: Info + Requirements (8 cols) vs Timeline & Notes (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Customer & Facility Information */}
          <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              Customer & Healthcare Organization
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#163A5C] rounded-xl">
                <span className="text-slate-400 block font-semibold mb-1">Healthcare Institution:</span>
                <strong className="text-slate-900 dark:text-slate-100 text-sm block">{enquiry.organization}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#163A5C] rounded-xl">
                <span className="text-slate-400 block font-semibold mb-1">Contact Officer:</span>
                <strong className="text-slate-900 dark:text-slate-100 text-sm block">{enquiry.customerName}</strong>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#163A5C] rounded-xl">
                <span className="text-slate-400 block font-semibold mb-1">Email Address:</span>
                <a href={`mailto:${enquiry.email || enquiry.emailAddress}`} className="text-sky-600 font-medium hover:underline block truncate">
                  {enquiry.email || enquiry.emailAddress}
                </a>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#163A5C] rounded-xl">
                <span className="text-slate-400 block font-semibold mb-1">Phone / Mobile:</span>
                <a href={`tel:${enquiry.phone || enquiry.phoneNumber}`} className="text-slate-900 dark:text-slate-100 font-mono font-medium hover:underline block">
                  {enquiry.phone || enquiry.phoneNumber}
                </a>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-[#163A5C] rounded-xl flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Delivery Destination / Facility Location: <strong>{enquiry.location}</strong></span>
              </div>
            </div>
          </div>

          {/* Equipment Requirements */}
          <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              Required Equipment Specifications
            </h2>

            <div className="space-y-3">
              {enquiry.items?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-[#163A5C] bg-sky-50/20">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.productName}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.specifications}</p>
                    </div>
                    <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-lg text-xs font-black shrink-0">
                      Qty: {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Engineering Services Required Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                enquiry.installationRequired ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-slate-50 dark:bg-[#163A5C] border-slate-200 dark:border-[#163A5C] text-slate-500'
              }`}>
                <Wrench className="w-4 h-4" />
                <span>On-Site Equipment Installation: {enquiry.installationRequired ? 'YES (Requested)' : 'No'}</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                enquiry.trainingRequired ? 'bg-sky-50 border-sky-200 text-sky-800' : 'bg-slate-50 dark:bg-[#163A5C] border-slate-200 dark:border-[#163A5C] text-slate-500'
              }`}>
                <GraduationCap className="w-4 h-4" />
                <span>Clinician & Technician Training: {enquiry.trainingRequired ? 'YES (Requested)' : 'No'}</span>
              </div>
            </div>

            {enquiry.additionalRequirements && (
              <div className="p-3.5 bg-slate-50 dark:bg-[#163A5C] rounded-xl border border-slate-200/80 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Additional Project Specifications & Notes:</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{enquiry.additionalRequirements}</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Workflow Control & Timeline (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Assignment & Status Controls */}
          <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Pipeline Progression</h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white dark:bg-[#0A1C2E] font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="New">New Requisition</option>
                <option value="Contacted">Sales Contacted</option>
                <option value="Quotation Sent">Quotation Sent</option>
                <option value="Follow-up">Institutional Follow-up</option>
                <option value="Converted">Converted to Purchase</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Assigned Administrator
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white dark:bg-[#0A1C2E] font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Administrator">Administrator</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-[#0A1C2E] p-5 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Activity Audit Timeline
            </h3>

            <div className="space-y-4 border-l-2 border-slate-100 pl-3 ml-1.5 text-xs">
              {enquiry.timeline?.map((t, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-sky-600 ring-4 ring-sky-100" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{t.event || t.status}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{t.description || t.note}</p>
                </div>
              ))}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-100 space-y-2">
              <textarea
                rows={2}
                required
                placeholder="Log internal note or sales communication..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Log Activity Entry
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
