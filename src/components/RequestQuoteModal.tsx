'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Send, FileText, Building2, User, Phone, Mail, MapPin, Wrench, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';

interface RequestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: string;
}

export function RequestQuoteModal({ isOpen, onClose, preselectedProduct = '' }: RequestQuoteModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    organization: '',
    phoneNumber: '',
    emailAddress: '',
    equipmentRequired: preselectedProduct || '',
    quantity: 1,
    requiredSpecifications: '',
    location: '',
    installationRequired: true,
    trainingRequired: true,
    additionalRequirements: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    setTouchCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStartY !== null && touchCurrentY !== null) {
      const distance = touchCurrentY - touchStartY;
      if (distance > 100) {
        handleClose();
      }
    }
    setTouchStartY(null);
    setTouchCurrentY(null);
  };

  const translateY = touchStartY !== null && touchCurrentY !== null && touchCurrentY > touchStartY
    ? touchCurrentY - touchStartY
    : 0;

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.createEnquiry({
        customerName: formData.customerName,
        organization: formData.organization,
        phoneNumber: formData.phoneNumber,
        emailAddress: formData.emailAddress,
        equipmentSummary: formData.equipmentRequired,
        quantityTotal: Number(formData.quantity) || 1,
        requiredSpecifications: formData.requiredSpecifications,
        location: formData.location,
        installationRequired: formData.installationRequired,
        trainingRequired: formData.trainingRequired,
        additionalRequirements: formData.additionalRequirements,
        source: 'website',
      });

      setSubmittedEnquiry(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to submit quotation requisition.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmittedEnquiry(null);
    handleClose();
  }

  return (
    <div className={`fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0F2A43]/70 backdrop-blur-xs ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
      <div 
        className={`relative w-full max-w-2xl bg-[#0F2A43] rounded-t-[32px] sm:rounded-2xl overflow-hidden max-h-[95vh] sm:max-h-[92vh] flex flex-col shadow-2xl ${isClosing ? 'animate-slideDownSheet' : 'animate-slideUpSheet sm:animate-fadeIn'}`}
        style={{ transform: translateY > 0 ? `translateY(${translateY}px)` : undefined, transition: touchStartY === null ? 'transform 0.2s ease-out' : 'none' }}
      >
        
        {/* Modal Header: Deep Medical Navy */}
        <div 
          className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 bg-[#0F2A43] text-white border-b border-[#163A5C] relative select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag Handle Indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full sm:hidden" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#163A5C] flex items-center justify-center text-[#13A8C7] shrink-0 border border-[#1A4269]">
              <FileText className="w-5 h-5 text-[#13A8C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">Request Official Quotation</h3>
                <span className="hidden sm:inline-flex text-[10px] font-semibold bg-[#1769E0]/30 text-[#93C5FD] border border-[#1769E0]/40 px-2 py-0.5 rounded-full">
                  B2B Desk
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-normal">
                Direct requisition to Sales Engineering • 2-4 hr turnaround
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#163A5C] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white dark:bg-[#111C2E]" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
          {submittedEnquiry ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-[#F0F6FE] dark:bg-[#162742] text-[#1769E0] dark:text-[#38BDF8] rounded-full flex items-center justify-center mx-auto border border-[#E2E8F0] dark:border-slate-800">
                <CheckCircle2 className="w-6 h-6 text-[#1769E0] dark:text-[#38BDF8]" />
              </div>
              <h4 className="text-lg font-bold text-[#0F2A43] dark:text-white">Quotation Request Submitted</h4>
              <div className="p-4 bg-[#F8FAFC] dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-800 rounded-xl max-w-md mx-auto text-left text-xs space-y-1.5">
                <div><span className="text-[#64748B] dark:text-slate-400 font-medium">Reference ID:</span> <strong className="text-[#0F2A43] dark:text-slate-100 font-mono text-xs ml-1">{submittedEnquiry.enquiryId}</strong></div>
                <div><span className="text-[#64748B] dark:text-slate-400 font-medium">Requisitioner:</span> <strong className="text-[#0F2A43] dark:text-slate-100 ml-1">{submittedEnquiry.customerName} ({submittedEnquiry.organization})</strong></div>
                <div><span className="text-[#64748B] dark:text-slate-400 font-medium">Equipment:</span> <strong className="text-[#0F2A43] dark:text-slate-100 ml-1">{submittedEnquiry.equipmentSummary}</strong></div>
                <div><span className="text-[#64748B] dark:text-slate-400 font-medium">Delivery Location:</span> <strong className="text-[#0F2A43] dark:text-slate-100 ml-1">{submittedEnquiry.location}</strong></div>
                <div><span className="text-[#64748B] dark:text-slate-400 font-medium">Routing:</span> <span className="text-[#1769E0] dark:text-[#38BDF8] font-semibold ml-1">Dispatched to Sales Engineering Desk</span></div>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-md mx-auto leading-relaxed font-normal">
                A formal commercial quotation with official proforma documentation and warranty options will be delivered to <strong className="dark:text-white">{submittedEnquiry.emailAddress}</strong> within <strong className="dark:text-white">2 to 4 business hours</strong>.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-[#1769E0] hover:bg-[#1258BF] text-white rounded-lg text-xs font-semibold transition shadow-xs"
                >
                  Done & Return
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900">{error}</div>}

              {/* Section 1: Contact & Institution Details */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">
                  1. Contact & Healthcare Facility
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#10233F] dark:text-slate-200 mb-1">
                      Full Name / Officer <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Dr. / Eng. / Procurement Lead"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-lg text-[#10233F] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[#10233F] dark:text-slate-200 mb-1">
                      Hospital / Institution <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Hospital, Clinic, or Diagnostic Lab"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-lg text-[#10233F] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#10233F] dark:text-slate-200 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        placeholder="Contact number with country code"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-lg text-[#10233F] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[#10233F] dark:text-slate-200 mb-1">
                      Official Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        placeholder="procurement@hospital.org"
                        value={formData.emailAddress}
                        onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-lg text-[#10233F] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Equipment Requirements */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">
                  2. Equipment & Logistics
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block font-medium text-[#10233F] dark:text-slate-200 mb-1">
                      Product / System Required <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ICU Ventilator / Hematology Analyzer / Ultrasound System"
                      value={formData.equipmentRequired}
                      onChange={(e) => setFormData({ ...formData, equipmentRequired: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-lg text-[#10233F] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#10233F] dark:text-slate-200 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-lg text-[#10233F] dark:text-slate-100 text-center font-semibold focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#10233F] dark:text-slate-200 mb-1">
                      Facility Location (City, Country) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. City, State / Country"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-lg text-[#10233F] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[#10233F] dark:text-slate-200 mb-1">
                      Voltage / Technical Standards (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 220V 50Hz, touchscreen, DICOM"
                      value={formData.requiredSpecifications}
                      onChange={(e) => setFormData({ ...formData, requiredSpecifications: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-lg text-[#10233F] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Technical Services & Tender Notes */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">
                  3. Technical Services & Contract Preferences
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    formData.installationRequired
                      ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium'
                      : 'bg-gray-50 dark:bg-[#0B1320] border-gray-200 dark:border-slate-700/80 text-gray-600 dark:text-slate-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.installationRequired}
                      onChange={(e) => setFormData({ ...formData, installationRequired: e.target.checked })}
                      className="rounded text-[#1769E0] focus:ring-[#1769E0]"
                    />
                    <Wrench className={`w-3.5 h-3.5 shrink-0 ${formData.installationRequired ? 'text-[#1769E0] dark:text-[#38BDF8]' : 'text-gray-400 dark:text-slate-500'}`} />
                    <span className="text-[11px] leading-tight">Installation & IQ/OQ/PQ Commissioning</span>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    formData.trainingRequired
                      ? 'bg-cyan-50/60 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-300 font-medium'
                      : 'bg-gray-50 dark:bg-[#0B1320] border-gray-200 dark:border-slate-700/80 text-gray-600 dark:text-slate-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.trainingRequired}
                      onChange={(e) => setFormData({ ...formData, trainingRequired: e.target.checked })}
                      className="rounded text-[#13A8C7] focus:ring-[#13A8C7]"
                    />
                    <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${formData.trainingRequired ? 'text-[#13A8C7]' : 'text-gray-400 dark:text-slate-500'}`} />
                    <span className="text-[11px] leading-tight">Certified Operator & Staff Training</span>
                  </label>
                </div>

                <div>
                  <textarea
                    rows={3}
                    placeholder="Additional tender specifications, AMC warranty preference, or special instructions..."
                    value={formData.additionalRequirements}
                    onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white dark:bg-[#0B1320] border border-[#E2E8F0] dark:border-slate-700/80 rounded-lg text-[#10233F] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] focus:outline-none transition resize-none overflow-hidden"
                  />
                </div>
              </div>

              {/* Submit CTA & Trust Badges */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 bg-[#1769E0] hover:bg-[#1258BF] active:scale-[0.99] text-white font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Registering Requisition...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>Submit Quotation Request</span>
                    </>
                  )}
                </button>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-3 text-[11px] text-gray-500 font-medium">
                  <span className="inline-flex items-center gap-1">
                    ⚡ <strong>2-4 Hrs</strong> Turnaround
                  </span>
                  <span className="inline-flex items-center gap-1">
                    📄 <strong>Proforma Invoice</strong> Included
                  </span>
                  <span className="inline-flex items-center gap-1">
                    🔒 <strong>Encrypted</strong> B2B Desk
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
