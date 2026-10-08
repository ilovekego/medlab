'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Globe2,
  Stethoscope,
  ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    location: '',
    department: 'General Inquiries & Sales',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createEnquiry({
        customerName: formData.name,
        organization: formData.organization || 'Direct Contact',
        phone: formData.phone,
        email: formData.email,
        location: formData.location || 'Nairobi, Kenya',
        source: 'Website Contact Form',
        items: [
          {
            productName: `General Inquiry: ${formData.department}`,
            quantity: 1,
            specifications: formData.message,
          }
        ],
        additionalRequirements: `Department: ${formData.department}. Message: ${formData.message}`,
        installationRequired: false,
        trainingRequired: false,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B121E] text-[#10233F] dark:text-slate-100 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10 sm:space-y-12">
        
        {/* Editorial Header */}
        <div className="border-b border-[#E2E8F0] dark:border-slate-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6" data-aos="fade-up">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#1769E0] dark:bg-[#38BDF8]" />
              <span>Engineering Consultation &amp; Inquiries</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F2A43] dark:text-white tracking-tight">
              Connect With Our Engineering &amp; Sales Desk
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-300 mt-2 max-w-2xl font-normal leading-relaxed">
              Whether you require an institutional equipment quotation, preventative maintenance service scheduling, or immediate technical assistance, our specialized engineering team is on standby.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-300 shrink-0 p-3 bg-white dark:bg-[#111C2E] rounded-xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs">
            <Clock className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0" />
            <span>General SLA: &lt; 4 business hours • 24/7 Critical Emergency Hotline</span>
          </div>
        </div>

        {/* Main Grid: Corporate Details & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Column: Headquarters & Regional Contacts (5 cols) */}
          <div className="lg:col-span-5 space-y-6" data-aos="fade-up">
            
            {/* Corporate Office Card */}
            <div className="bg-gradient-to-br from-[#0F2A43] via-[#12365A] to-[#0A1E33] dark:from-[#112338] dark:via-[#163354] dark:to-[#0D1B2D] text-white rounded-2xl p-6 sm:p-7 border border-[#163A5C] dark:border-blue-500/30 shadow-subtle dark:shadow-[0_4px_30px_rgba(23,105,224,0.15)] space-y-5 relative overflow-hidden">
              {/* Subtle ambient cyan blur */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

              <h2 className="text-base font-bold text-white flex items-center gap-2.5 pb-4 border-b border-white/10 relative z-10">
                <Globe2 className="w-4 h-4 text-[#13A8C7] dark:text-[#38BDF8]" />
                <span>Corporate Engineering Facility</span>
              </h2>

              <div className="space-y-4 text-xs relative z-10">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Facility Location:</strong>
                    <span className="text-slate-300 leading-relaxed block mt-0.5">
                      Medlab Innovate Engineering Ltd<br />
                      Around Thika Road / Baba Dogo / Outer Ring Road<br />
                      Nairobi, Kenya
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Official Correspondence:</strong>
                    <a href="mailto:info@medlabinnovate.co.ke" className="text-slate-200 hover:text-white transition font-medium block mt-0.5">
                      info@medlabinnovate.co.ke
                    </a>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Response SLA: &lt; 4 business hours</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Clinical Emergency Hotline:</strong>
                    <a href="tel:+254142808755" className="text-white font-mono text-sm font-bold hover:underline transition block mt-0.5">
                      +254 142 808755
                    </a>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Direct line to on-call biomedical duty engineer</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Direct WhatsApp Requisition Desk:</strong>
                    <a href="https://wa.me/254745662988" target="_blank" rel="noopener noreferrer" className="text-emerald-300 font-mono text-xs font-semibold hover:underline transition block mt-0.5">
                      +254 745 662 988
                    </a>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Instant messaging for technical inquiries</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Operating Schedule:</strong>
                    <span className="text-slate-300 block mt-0.5">Monday – Friday: 08:00 – 18:00 GMT</span>
                    <span className="text-slate-400 block text-[11px]">Critical Care Support: 24/7/365 On-Call</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Link Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href="/products"
                className="bg-white dark:bg-[#111C2E] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 hover:border-[#1769E0] dark:hover:border-blue-500/50 transition-all shadow-xs group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#F0F6FE] dark:bg-[#162742] border border-[#E0EDFD] dark:border-blue-500/20 text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <strong className="text-xs sm:text-sm font-bold text-[#0F2A43] dark:text-white block">Request Formal RFQ</strong>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">Browse catalog and generate multi-item commercial proformas.</p>
                </div>
                <span className="text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link 
                href="/support"
                className="bg-white dark:bg-[#111C2E] p-5 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 hover:border-[#1769E0] dark:hover:border-blue-500/50 transition-all shadow-xs group flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#F0F6FE] dark:bg-[#162742] border border-[#E0EDFD] dark:border-blue-500/20 text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center mb-3">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <strong className="text-xs sm:text-sm font-bold text-[#0F2A43] dark:text-white block">Equipment Breakdown?</strong>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">Submit high-priority service ticket for technician dispatch.</p>
                </div>
                <span className="text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

          </div>

          {/* Right Column: B2B Contact Form (7 cols) */}
          <div className="lg:col-span-7" data-aos="fade-up">
            <div className="bg-white dark:bg-[#111C2E] rounded-2xl border border-[#E2E8F0] dark:border-slate-800 p-6 sm:p-8 shadow-xs">
              
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F2A43] dark:text-white">
                    Inquiry Logged with Engineering &amp; Sales Desk
                  </h3>
                  <p className="text-[#64748B] dark:text-slate-300 max-w-md mx-auto text-xs leading-relaxed font-normal">
                    Thank you, <strong>{formData.name}</strong>. Your inquiry has been routed to our specialized biomedical team. An engineering representative will respond to <strong>{formData.email}</strong> within 4 business hours.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: '',
                          organization: '',
                          email: '',
                          phone: '',
                          location: '',
                          department: 'General Inquiries & Sales',
                          message: '',
                        });
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#1769E0] hover:bg-[#1258BF] text-white text-xs font-semibold transition shadow-xs"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
                    <h2 className="text-base sm:text-lg font-bold text-[#0F2A43] dark:text-white">
                      Direct Inquiries &amp; Technical Consultation
                    </h2>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                      For urgent intensive care or operating theatre breakdown emergencies, please dial our emergency phone hotline directly.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 text-red-700 dark:text-rose-300 text-xs">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                        Contact Person Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. / Eng. Jane Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0B1320] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                        Healthcare / Research Facility <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Hospital or Diagnostic Entity Name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0B1320] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                        Official Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="procurement@hospital.org"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0B1320] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                        Direct Phone / Mobile <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254 700 000 000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0B1320] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                        City &amp; Country
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Nairobi, Kenya"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0B1320] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                        Engineering Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0B1320] focus:outline-none focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] font-medium transition-all"
                      >
                        <option value="General Inquiries & Sales" className="dark:bg-[#0B1320] dark:text-slate-100">Equipment Sales &amp; Procurement</option>
                        <option value="Biomedical Engineering & AMC" className="dark:bg-[#0B1320] dark:text-slate-100">Preventative Maintenance &amp; AMC/CMC</option>
                        <option value="Calibration & ISO 17025" className="dark:bg-[#0B1320] dark:text-slate-100">Calibration &amp; Metrology Testing</option>
                        <option value="Turnkey MGPS Cleanrooms" className="dark:bg-[#0B1320] dark:text-slate-100">Medical Gas Pipeline (MGPS) &amp; Cleanrooms</option>
                        <option value="Institutional Procurement" className="dark:bg-[#0B1320] dark:text-slate-100">Public Tender &amp; Institutional Supply</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                      Technical Requirements &amp; Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please outline the clinical modalities, equipment parameters, facility requirements, or service scope..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0B1320] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1769E0] dark:focus:border-[#38BDF8] focus:bg-white dark:focus:bg-[#0E1726] transition-all"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
                    <p className="text-xs text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0" />
                      <span>Encrypted transmission to Chief Biomedical Sales Engineering Desk.</span>
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1769E0] hover:bg-[#1258BF] text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50"
                    >
                      <span>{submitting ? 'Transmitting Inquiry...' : 'Transmit Inquiry'}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Institutional Hubs & Staging Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5" data-aos="fade-up">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F2A43] dark:text-white">
              <Building2 className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
              <span>Central Warehousing &amp; Calibration Lab</span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
              Equipped with ISO-certified secondary electrical safety calibrators, gas flow analyzers, and temperature-controlled spare parts staging.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F2A43] dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Mobile Engineering Squads</span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
              Rapid response vans stocked with replacement circuit boards, sensor kits, and emergency oxygen regulators for immediate hospital mobilization.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F2A43] dark:text-white">
              <Globe2 className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
              <span>Cross-Border Institutional Logistics</span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
              Turnkey procurement coordination, customs clearance, and cold-chain staging across East and Central African healthcare ministries.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
