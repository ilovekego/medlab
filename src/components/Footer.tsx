'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { CompanyLogo } from '@/components/CompanyLogo';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';

export function Footer() {
  return (
    <footer className="bg-[#0F2A43] dark:bg-[#070D18] text-slate-300 border-t border-[#163A5C] dark:border-slate-800/80 pt-14 pb-8 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#163A5C] dark:border-slate-800/80">
          
          {/* Col 1 & 2: Brand & Corporate Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="mb-3">
              <CompanyLogo variant="white" className="h-10 sm:h-11 w-auto" />
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm font-normal">
              Medlab Innovate Engineering Ltd provides certified diagnostic instrumentation, turnkey installation, NIST-traceable metrology, and full biomedical lifecycle support.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#13A8C7]" />
                <span>ISO 13485:2016 Compliant Quality Framework</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-[#1769E0]" />
                <span>24/7 Breakdown Emergency Dispatch for Critical Care</span>
              </div>
            </div>
          </div>

          {/* Col 3: Equipment Disciplines */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-4 tracking-wider uppercase">Equipment Catalog</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link href="/products?category=Hospital+Medical+Equipment" className="hover:text-white transition-colors text-slate-300">Hospital Medical Equipment</Link></li>
              <li><Link href="/products?category=Laboratory+Equipment" className="hover:text-white transition-colors text-slate-300">Laboratory Analyzers</Link></li>
              <li><Link href="/products?category=Analytical+Instruments" className="hover:text-white transition-colors text-slate-300">Analytical Instruments</Link></li>
              <li><Link href="/products?category=Molecular+Biology+%26+Life+Science+Equipment" className="hover:text-white transition-colors text-slate-300">Molecular Biology & Life Science</Link></li>
              <li><Link href="/products?category=General+Research+%26+Scientific+Equipment" className="hover:text-white transition-colors text-slate-300">General Research & Scientific</Link></li>
              <li><Link href="/products?category=Consumables" className="hover:text-white transition-colors text-slate-300">Consumables & Probes</Link></li>
              <li><Link href="/products?category=Engineering+Solutions" className="hover:text-white transition-colors text-slate-300">Engineering Solutions</Link></li>
            </ul>
          </div>

          {/* Col 4: Technical Services */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-4 tracking-wider uppercase">Technical Services</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link href="/services" className="hover:text-white transition-colors text-slate-300">Installation & Commissioning</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors text-slate-300">Preventive Maintenance (AMC/CMC)</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors text-slate-300">Biomedical Calibration & Metrology</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors text-slate-300">Emergency Repair Dispatch</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors text-slate-300">Genuine OEM Spare Parts</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors text-slate-300">Operator & Biomedical Training</Link></li>
            </ul>
          </div>

          {/* Col 5: Verified Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-4 tracking-wider uppercase">Contact Desk</h4>
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1769E0] shrink-0 mt-0.5" />
                <span>Around Thika Road / Baba Dogo / Outer Ring Road, Nairobi, Kenya</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#1769E0] shrink-0" />
                <a href="tel:+254142808755" className="hover:text-white font-mono font-medium">Tel: +254 142 808755</a>
              </div>
              <div className="flex items-center gap-2.5">
                <WhatsAppIcon className="w-4 h-4 text-[#13A8C7] shrink-0" />
                <a href="https://wa.me/254745662988" target="_blank" rel="noopener noreferrer" className="hover:text-white font-mono font-medium text-slate-200">+254 745 662 988</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1769E0] shrink-0" />
                <a href="mailto:info@medlabinnovate.co.ke" className="hover:text-white font-medium text-slate-200">info@medlabinnovate.co.ke</a>
              </div>
              <div className="pt-2 text-[11px] text-slate-400">
                Operating Hours: Mon - Fri: 08:00 - 18:00 GMT<br />
                Critical Hospital ICU Support: 24/7/365
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col lg:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Medlab Innovate Engineering Ltd. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-600">•</span>
            <p>
              Developed by{' '}
              <a 
                href="https://vinniedigitalhub.co.ke/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-200 hover:text-white transition-colors font-medium underline decoration-slate-600 underline-offset-4"
              >
                Vinnie Digital Hub
              </a>
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="/about" className="hover:text-white transition-colors">Quality Policy</Link>
            <Link href="/support" className="hover:text-white transition-colors">Service Desk</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Procurement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
