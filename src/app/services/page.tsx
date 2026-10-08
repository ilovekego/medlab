'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Gauge, 
  AlertTriangle, 
  Cpu, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

const ICON_MAP: Record<string, any> = {
  Wrench,
  ShieldCheck,
  Gauge,
  AlertTriangle,
  Cpu,
  GraduationCap
};

export default function ServicesPage() {
  const serviceList = [
    {
      title: 'Equipment Installation & Commissioning',
      icon: Wrench,
      tag: 'Certified Biomedical Engineers',
      desc: 'End-to-end site preparation, environmental checks, hardware assembly, electrical safety testing, and formal IQ/OQ/PQ validation according to manufacturer protocols.',
      deliverables: [
        'Site readiness inspection & electrical safety auditing (IEC 62353)',
        'Unboxing, rigging, and precision mechanical assembly',
        'Integration into hospital infrastructure (MGPS, LAN, PACS, LIS/HIS)',
        'Baseline calibration, software setup, and protocol verification',
        'Handover sign-off dossier with official Commissioning Certificates',
      ],
      sla: 'On-site deployment within 24-48 hours of site readiness',
    },
    {
      title: 'Preventive Maintenance (AMC & CMC)',
      icon: ShieldCheck,
      tag: 'Continuous Hospital Availability',
      desc: 'Annual Maintenance Contracts (AMC) and Comprehensive Maintenance Contracts (CMC) designed to eliminate unexpected breakdowns and protect institutional capital investment.',
      deliverables: [
        'Scheduled quarterly or bi-annual on-site biomedical servicing',
        'Detailed 45-point checklist covering pneumatic and electrical tolerances',
        'Proactive renewal of filters, vacuum seals, and aging battery cells',
        'Priority emergency call-out dispatch with guaranteed turnaround',
        'Digital asset health reports logged for accreditation audits',
      ],
      sla: 'Guaranteed rapid response for critical ICU / operating theatre devices',
    },
    {
      title: 'Biomedical Calibration & Metrology',
      icon: Gauge,
      tag: 'NIST & ISO/IEC Traceable',
      desc: 'Precision testing and calibration utilizing certified biomedical test analyzers to guarantee diagnostic accuracy and regulatory audit readiness.',
      deliverables: [
        'Defibrillator energy & pacer rate calibration',
        'Ventilator flow, pressure, volume, and oxygen sensor calibration',
        'Patient monitor NIBP, SpO2, and ECG simulator validation',
        'Laboratory centrifuge speed (tachometer) and temperature calibration',
        'Traceable Biomedical Calibration Certificates with uncertainty calculations',
      ],
      sla: 'Turnaround within 24-48 hours on-site',
    },
    {
      title: '24/7 Breakdown & Emergency Repair',
      icon: AlertTriangle,
      tag: 'Emergency Response Helpline',
      desc: 'Rapid on-site emergency troubleshooting, board-level component rework, and fault diagnosis by senior biomedical field engineers.',
      deliverables: [
        '24/7 emergency dispatch helpline manned by biomedical specialists',
        'Rapid root-cause fault diagnosis on hydraulic, pneumatic, and electronic circuits',
        'Board-level component rework and micro-soldering repairs',
        'Temporary standby loaner equipment available for critical ICU devices',
        'Comprehensive post-repair verification and safety re-certification',
      ],
      sla: 'Immediate technician consultation and rapid regional dispatch',
    },
    {
      title: 'Servicing & Genuine OEM Spare Parts',
      icon: Cpu,
      tag: 'Manufacturer Certified Spares',
      desc: 'Direct access to verified OEM replacement boards, sensors, valves, pumps, tubes, and batteries with a 12-month manufacturer replacement warranty.',
      deliverables: [
        'Strategic inventory of critical replacement parts in regional warehouses',
        'Temperature-controlled storage for sensitive probes and diagnostic accessories',
        '100% genuine manufacturer-certified parts with batch tracking',
        '12-month full replacement warranty on all installed spares',
        'Express courier delivery across regional health facilities',
      ],
      sla: 'Same-day dispatch for in-stock components',
    },
    {
      title: 'User Training & Biomedical Certification',
      icon: GraduationCap,
      tag: 'Competency Programs',
      desc: 'Comprehensive operational and biomedical maintenance training for doctors, nurses, laboratory technicians, and hospital engineering staff.',
      deliverables: [
        'Clinical user training on device settings, alarms, and patient application',
        'Laboratory technician training on reagent handling and daily QC routines',
        'First-line biomedical maintenance training for internal hospital engineers',
        'Interactive hands-on practical workshops with simulated failure scenarios',
        'Individual Certificates of Competency issued to all participants',
      ],
      sla: 'Flexible scheduling for day, evening, or weekend clinical shifts',
    },
  ];

  const [activeServices, setActiveServices] = useState(serviceList);

  useEffect(() => {
    api.getCMS().then((res) => {
      if (Array.isArray(res.data?.services) && res.data.services.length > 0) {
        const mapped = res.data.services.map((item: any) => ({
          ...item,
          icon: ICON_MAP[item.iconName] || Wrench,
        }));
        setActiveServices(mapped);
      }
    }).catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B121E] text-[#10233F] dark:text-slate-100 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
        
        {/* Editorial Header */}
        <div className="border-b border-[#E2E8F0] dark:border-slate-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6" data-aos="fade-up">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#1769E0] dark:bg-[#38BDF8]" />
              <span>Biomedical Lifecycle Engineering</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F2A43] dark:text-white tracking-tight">
              Technical Engineering Services &amp; Maintenance
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-300 mt-2 max-w-2xl font-normal leading-relaxed">
              From hospital site survey and commissioning to multi-year maintenance agreements (AMC/CMC), NIST-traceable metrology, and 24/7 ICU breakdown repair.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/support"
              className="px-5 py-2.5 bg-[#1769E0] hover:bg-[#1258BF] text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
            >
              Open Service Ticket
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-white dark:bg-[#111C2E] hover:bg-[#F8FAFC] dark:hover:bg-[#162740] text-[#10233F] dark:text-slate-100 border border-[#E2E8F0] dark:border-slate-800 rounded-lg font-semibold text-xs transition-colors shadow-xs"
            >
              Consult an Engineer
            </Link>
          </div>
        </div>

        {/* Services List: Alternating Editorial Presentation */}
        <div className="space-y-6">
          {activeServices.map((s, idx) => {
            const IconComp = s.icon;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-[#111C2E] rounded-2xl border border-[#E2E8F0] dark:border-slate-800 hover:border-[#CBD5E1] dark:hover:border-blue-500/40 p-6 sm:p-8 transition-all shadow-xs"
                data-aos="fade-up"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Title & Narrative (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F0F6FE] dark:bg-[#162742] text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#1769E0] dark:text-[#38BDF8] bg-[#F0F6FE] dark:bg-[#162742]/60 px-2.5 py-0.5 rounded-md border border-[#E0EDFD] dark:border-slate-700/80">
                        {s.tag}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#0F2A43] dark:text-white">
                      {s.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
                      {s.desc}
                    </p>
                    <div className="pt-2">
                      <span className="text-[11px] font-mono text-[#64748B] dark:text-slate-400 block">
                        Standard Commitment: <strong className="text-[#0F2A43] dark:text-slate-200 font-sans font-semibold">{s.sla}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Scope of Deliverables (7 cols) */}
                  <div className="lg:col-span-7 bg-[#F8FAFC] dark:bg-[#0B1320] p-5 sm:p-6 rounded-xl border border-[#E2E8F0] dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0F2A43] dark:text-slate-200 block">
                      Certified Scope of Work &amp; Deliverables
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#64748B] dark:text-slate-300">
                      {s.deliverables.map((d, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 flex justify-end">
                      <Link
                        href="/support"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] hover:text-[#1258BF] dark:hover:text-blue-400"
                      >
                        <span>Schedule Engineering Dispatch</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Engineering Compliance Banner */}
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-[#0F2A43] via-[#12365A] to-[#0A1E33] dark:from-[#112338] dark:via-[#163354] dark:to-[#0D1B2D] text-white border border-[#163A5C] dark:border-blue-500/30 shadow-subtle dark:shadow-[0_4px_30px_rgba(23,105,224,0.15)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden" data-aos="fade-up">
          {/* Subtle ambient cyan lighting */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-1">
            <span className="text-xs font-semibold text-[#13A8C7] dark:text-[#38BDF8] uppercase tracking-wider block">
              Institutional Framework
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Need a custom Multi-Year Hospital Maintenance Agreement (CMC)?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-normal">
              We structure turnkey biomedical engineering agreements covering full clinical suites, medical gas pipelines, operating theatres, and ICU ventilators with bonded replacement loaners.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              href="/contact"
              className="px-6 py-3 bg-[#1769E0] hover:bg-[#1258BF] text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs inline-flex items-center gap-2"
            >
              <span>Request Agreement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
