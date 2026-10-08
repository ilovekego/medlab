'use client';

import React, { useState } from 'react';
import { Phone, Mail, X, Stethoscope, ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';

export function WhatsAppContactWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-30 whatsapp-widget">
      {/* Popover Card */}
      {open && (
        <div className="mb-3 w-80 bg-white dark:bg-[#111C2E] rounded-2xl border-0 shadow-2xl overflow-hidden animate-slideUp">
          <div className="bg-[#0F2A43] text-white p-4 flex items-center justify-between border-b border-[#1A385C]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#13A8C7]/20 border border-[#13A8C7]/30 flex items-center justify-center text-[#13A8C7]">
                <WhatsAppIcon className="w-4 h-4 text-[#13A8C7]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Medlab Direct Dispatch</h4>
                <p className="text-[10px] text-[#13A8C7] font-medium">Biomedical Technical Support Desk</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1A385C] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-2.5 text-xs bg-white dark:bg-[#111C2E]">
            <p className="text-[#64748B] dark:text-slate-400 leading-relaxed font-normal">
              Connect directly with our biomedical engineering desk or request urgent equipment service:
            </p>

            <a
              href="https://wa.me/254745662988"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#16233B] border border-[#E2E8F0] dark:border-slate-700/80 hover:border-[#13A8C7] transition-colors text-[#10233F] dark:text-slate-100 font-semibold"
            >
              <span className="flex items-center gap-2.5">
                <WhatsAppIcon className="w-4 h-4 text-[#13A8C7]" />
                <span>+254 745 662 988</span>
              </span>
              <span className="text-[10px] bg-[#13A8C7] text-white px-2 py-0.5 rounded-full font-bold">Online</span>
            </a>

            <a
              href="tel:+254142808755"
              className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#16233B] border border-[#E2E8F0] dark:border-slate-700/80 hover:border-[#1769E0] transition-colors text-[#10233F] dark:text-slate-100 font-medium"
            >
              <span className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
                <span>+254 142 808755</span>
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono">24/7 Call</span>
            </a>

            <a
              href="mailto:info@medlabinnovate.co.ke"
              className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#16233B] border border-[#E2E8F0] dark:border-slate-700/80 hover:border-[#1769E0] transition-colors text-[#10233F] dark:text-slate-100 font-medium"
            >
              <span className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
                <span>info@medlabinnovate.co.ke</span>
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono">&lt; 4hr SLA</span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Solid Sleek Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0F2A43] hover:bg-[#0A1E31] text-white font-semibold text-xs border border-[#1A385C] transition-all duration-200 group shadow-lg hover:shadow-xl"
        aria-label="Contact / WhatsApp Assistance"
      >
        <WhatsAppIcon className="w-4 h-4 text-[#13A8C7]" />
        <span className="hidden sm:inline">Direct Assistance</span>
      </button>
    </div>
  );
}
