'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, fallbackProducts } from '@/lib/api';
import { IProduct } from '@/lib/types';
import { 
  ShieldCheck, 
  ArrowRight, 
  Wrench, 
  FileText, 
  Clock, 
  Cpu, 
  GraduationCap, 
  FlaskConical, 
  Microscope,
  Activity,
  Headphones,
  Award,
  Zap,
  Package,
  Layers,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Building2,
  FileCheck2,
  Gauge
} from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>(fallbackProducts);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getProducts('?featured=true&limit=6');
        if (res.data && res.data.length > 0) {
          setFeaturedProducts(res.data);
        }
      } catch (err) {
        console.warn('Using fallback featured products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const coreDisciplines = [
    {
      category: 'CRITICAL CARE & OR',
      title: 'Hospital Medical Equipment',
      desc: 'Critical care ICU ventilators, patient monitoring, ultrasound, and surgical units.',
      icon: Activity,
      link: '/products?category=Hospital+Medical+Equipment',
    },
    {
      category: 'CLINICAL DIAGNOSTICS',
      title: 'Laboratory Equipment',
      desc: 'Automated 5-part hematology, clinical biochemistry, and centrifuges.',
      icon: Microscope,
      link: '/products?category=Laboratory+Equipment',
    },
    {
      category: 'DIAGNOSTIC SUPPLIES',
      title: 'Consumables & Probes',
      desc: 'High-purity diagnostic reagents, lyse packs, SpO2 sensor probes, and leadwires.',
      icon: Package,
      link: '/products?category=Consumables',
    },
    {
      category: 'TECHNICAL LIFECYCLES',
      title: 'Engineering Services',
      desc: 'Turnkey commissioning, NIST calibration, AMC/CMC contracts, and repairs.',
      icon: Wrench,
      link: '/services',
    },
  ];

  const engineeringServices = [
    {
      title: 'Installation & Commissioning',
      desc: 'Pre-installation site survey, electrical safety testing (IEC 62353), precision mechanical assembly, and IQ/OQ/PQ validation according to manufacturer protocols.',
      sla: 'On-site deployment within 24-48 hours',
      icon: Wrench,
    },
    {
      title: 'Preventive Maintenance (AMC/CMC)',
      desc: 'Scheduled quarterly biomedical servicing, filter renewals, pneumatic calibration, and multi-point audits designed to prevent equipment failure.',
      sla: 'Comprehensive contracts for hospital uptime',
      icon: ShieldCheck,
    },
    {
      title: 'Biomedical Calibration & Metrology',
      desc: 'Precision calibration using NIST-traceable electrical safety analyzers, defibrillator analyzers, and ventilator flow simulators.',
      sla: 'Full Calibration Certificates issued',
      icon: Gauge,
    },
    {
      title: 'Troubleshooting & Emergency Repair',
      desc: 'Rapid on-site emergency troubleshooting, board-level component rework, and fault diagnosis for critical intensive care and theatre devices.',
      sla: 'Priority emergency response hotline',
      icon: Headphones,
    },
    {
      title: 'Servicing & Genuine OEM Spares',
      desc: 'Direct access to certified OEM replacement components, sensors, valves, transducers, and rechargeable battery packs.',
      sla: '12-month manufacturer replacement warranty',
      icon: Cpu,
    },
    {
      title: 'User & Biomedical Training',
      desc: 'Structured operator training and competency certification for clinical doctors, nursing staff, and hospital engineering teams.',
      sla: 'Certificates of Competency upon completion',
      icon: GraduationCap,
    },
  ];

  const complianceStandards = [
    {
      code: 'ISO 13485:2016',
      title: 'Medical Devices Quality Management',
      desc: 'Governing the procurement, distribution, storage, and technical maintenance of medical equipment.',
    },
    {
      code: 'IEC 62353',
      title: 'Medical Electrical Equipment Testing',
      desc: 'Strict recurrent testing and post-repair electrical safety inspection standards for patient safety.',
    },
    {
      code: 'NIST Traceability',
      title: 'Certified Calibration Metrology',
      desc: 'All biomedical test instruments and simulators are traceable to NIST and international metrology standards.',
    },
    {
      code: 'CE-IVD & FDA',
      title: 'Registered Clinical Instrumentation',
      desc: 'Supplying verified clinical diagnostic equipment complying with European MDR and international regulations.',
    },
  ];

  const verifiedPartners = [
    { name: 'Kenyatta National Hospital', category: 'National Referral Hospital', logo: '/images/clients/knh.jpg' },
    { name: "The St. Paul's Hospital Kitengela", category: 'Comprehensive Healthcare Facility', logo: '/images/clients/stpauls.jpg' },
    { name: 'Ultralab E.A Ltd.', category: 'Clinical Diagnostic & Pathology Lab', logo: '/images/clients/ultralab.jpg' },
    { name: 'Surgipath Services E.A. Ltd.', category: 'Surgical & Histopathology Partner', logo: '/images/clients/surgipath.jpg' },
    { name: 'Palamed Healthcare', category: 'Medical & Laboratory Solutions', logo: '/images/clients/palamed.jpg' },
  ];

  const filteredProducts = activeCategory === 'All'
    ? featuredProducts
    : featuredProducts.filter(p => p.category?.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="bg-white dark:bg-[#0B121E] text-[#10233F] dark:text-slate-100 transition-colors">
      
      {/* 1. HERO SECTION: Split Editorial Corporate Presentation (Matches Reference Exactly) */}
      <section className="relative pt-6 sm:pt-8 pb-8 sm:pb-10 border-b border-[#E2E8F0] dark:border-slate-800/80 bg-white dark:bg-[#0B121E] overflow-hidden">
        {/* Subtle high-tech ambient glow in dark mode */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headline, Description, Actions & Metrics */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5" data-aos="fade-up">
              
              {/* Authoritative Main Headline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.35rem] xl:text-[2.65rem] font-bold tracking-tight text-[#0F2A43] dark:text-white leading-[1.2] sm:leading-[1.15]">
                Certified Clinical <span className="whitespace-nowrap">Instrumentation &amp;</span>
                <span className="sm:hidden"> </span>
                <br className="hidden sm:inline" />
                Turnkey Healthcare Engineering
              </h1>

              {/* Factual Corporate Subtext */}
              <p className="text-sm sm:text-[15px] text-[#64748B] dark:text-slate-300 leading-relaxed max-w-xl font-normal">
                Medlab Innovate Engineering Ltd provides certified diagnostic instrumentation, turnkey installation, NIST-traceable calibration, and comprehensive maintenance agreements for healthcare facilities, referral pathology laboratories, and diagnostic centers.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/products"
                  className="w-full sm:w-auto justify-center px-5 py-3 sm:py-2.5 bg-[#1769E0] hover:bg-[#1258BF] text-white rounded-lg font-semibold text-sm inline-flex items-center gap-2 shadow-xs transition-colors"
                >
                  <span>View Equipment Catalog</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    const event = new CustomEvent('open-quote-modal', { detail: {} });
                    window.dispatchEvent(event);
                  }}
                  className="w-full sm:w-auto justify-center px-5 py-3 sm:py-2.5 bg-white dark:bg-[#111C2E] hover:bg-[#F8FAFC] dark:hover:bg-[#162740] text-[#10233F] dark:text-slate-100 border border-[#E2E8F0] dark:border-slate-800 hover:border-[#CBD5E1] dark:hover:border-slate-700 rounded-lg font-semibold text-sm inline-flex items-center gap-2 shadow-xs transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
                  <span>Request a Quotation (RFQ)</span>
                </button>
              </div>

              {/* 4-Column Engineering Quality Indicators */}
              <div className="pt-6 sm:pt-8 mt-2 border-t border-[#E2E8F0] dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 text-left" data-aos="fade-up" data-aos-delay="200">
                <div>
                  <span className="text-[11px] font-normal uppercase tracking-wider text-[#64748B] dark:text-slate-400 block mb-1.5">
                    Quality Standard
                  </span>
                  <span className="text-[13px] sm:text-[13px] font-medium text-[#10233F] dark:text-slate-100 block">
                    ISO 13485:2016 Compliant
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-normal uppercase tracking-wider text-[#64748B] dark:text-slate-400 block mb-1.5">
                    Commissioning
                  </span>
                  <span className="text-[13px] sm:text-[13px] font-medium text-[#10233F] dark:text-slate-100 block">
                    Turnkey IQ/OQ/PQ Setup
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-normal uppercase tracking-wider text-[#64748B] dark:text-slate-400 block mb-1.5">
                    Metrology
                  </span>
                  <span className="text-[13px] sm:text-[13px] font-medium text-[#10233F] dark:text-slate-100 block">
                    NIST-Traceable Calibration
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-normal uppercase tracking-wider text-[#64748B] dark:text-slate-400 block mb-1.5">
                    Support Desk
                  </span>
                  <span className="text-[13px] sm:text-[13px] font-medium text-[#10233F] dark:text-slate-100 block">
                    24/7 Breakdown Dispatch
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Real Laboratory Suite Visual with Caption Bar */}
            <div className="lg:col-span-5" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-white dark:bg-[#111C2E] rounded-2xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden shadow-xs dark:shadow-md">
                <div className="aspect-[16/10.5] w-full overflow-hidden bg-[#F8FAFC] dark:bg-slate-900 relative">
                  <img
                    src="/images/hero/hero_lab_suite.jpg"
                    alt="Advanced Clinical Laboratory Equipment Suite"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-3.5 sm:p-4 bg-white dark:bg-[#111C2E] border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#0F2A43] dark:text-slate-100">
                      Advanced Diagnostic &amp; Clinical Laboratory Suite
                    </h3>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      CE-IVD &amp; FDA Registered Instrumentation
                    </p>
                  </div>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] hover:text-[#1258BF] dark:hover:text-blue-400 shrink-0"
                  >
                    <span>Inspect Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CORE ENGINEERING DISCIPLINES (Directly below Hero) */}
      <section className="py-6 sm:py-7 border-b border-[#E2E8F0] dark:border-slate-800/80 bg-white dark:bg-[#0B121E]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {coreDisciplines.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.link}
                  className="group block p-4 sm:p-4.5 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#111C2E] hover:border-[#1769E0]/40 dark:hover:border-blue-500/40 hover:bg-[#F8FAFC] dark:hover:bg-[#16253D] transition-all shadow-xs"
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1769E0] dark:text-[#38BDF8]">
                      {item.category}
                    </span>
                    <IconComp className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h3 className="text-sm sm:text-[15px] font-semibold text-[#0F2A43] dark:text-slate-100 group-hover:text-[#1769E0] dark:group-hover:text-[#38BDF8] transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CORE PRODUCT CATALOG (Medical Equipment Presentation) */}
      <section className="py-14 sm:py-18 bg-[#F8FAFC] dark:bg-[#0D1525] border-b border-[#E2E8F0] dark:border-slate-800/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header with Category Filters */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#E2E8F0] dark:border-slate-800/80" data-aos="fade-up">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] uppercase tracking-wider mb-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Certified Clinical Catalog</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2A43] dark:text-white tracking-tight">
                Featured Medical &amp; Diagnostic Systems
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1.5 max-w-xl font-normal">
                Audited clinical specifications, guaranteed spare parts availability, and turnkey biomedical setup.
              </p>
            </div>

            {/* Department Quick Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Hospital Medical Equipment', 'Laboratory Equipment'].map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-[#1769E0] text-white shadow-xs'
                      : 'bg-white dark:bg-[#111C2E] text-[#64748B] dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700/80 hover:text-[#0F2A43] dark:hover:text-white hover:border-[#CBD5E1] dark:hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <Link
                href="/products"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] hover:underline inline-flex items-center gap-1"
              >
                <span>Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Product Cards Grid: Professional B2B Equipment Presentation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((p) => (
              <div 
                key={p._id}
                className="bg-white dark:bg-[#111C2E] rounded-xl border border-[#E2E8F0] dark:border-slate-800 hover:border-[#CBD5E1] dark:hover:border-blue-500/40 shadow-xs hover:shadow-subtle transition-all flex flex-col overflow-hidden group"
                data-aos="fade-up"
              >
                {/* Equipment Image Container */}
                <div className="h-60 bg-white dark:bg-[#0B1320] relative overflow-hidden flex items-center justify-center p-6 border-b border-[#E2E8F0] dark:border-slate-800">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/[0.04] dark:to-blue-600/[0.05] pointer-events-none" />
                  <img
                    src={p.images[0]?.url || '/images/hero_banner.jpg'}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-103 transition-transform duration-300 relative z-10"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white dark:bg-[#16233B] text-[#0F2A43] dark:text-blue-300 text-[11px] font-semibold rounded border border-[#E2E8F0] dark:border-slate-700/80 shadow-xs z-10">
                    {p.model}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#F8FAFC] dark:bg-[#0E182A] text-[#64748B] dark:text-slate-400 text-[10px] font-medium uppercase tracking-wider rounded border border-[#E2E8F0] dark:border-slate-800 z-10">
                    {p.brand}
                  </span>
                </div>

                {/* Content & Specifications Area */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold text-[#1769E0] dark:text-[#38BDF8] uppercase tracking-wider block mb-1">
                      {p.category}
                    </span>
                    <h3 className="text-base font-semibold text-[#0F2A43] dark:text-slate-100 leading-snug mb-2 group-hover:text-[#1769E0] dark:group-hover:text-[#38BDF8] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                      {p.shortDescription}
                    </p>
                  </div>

                  {/* Concise Technical Highlights Table */}
                  {p.specifications && p.specifications.length > 0 && (
                    <div className="py-2 px-3 bg-[#F8FAFC] dark:bg-[#0A1321] rounded-lg border border-[#E2E8F0] dark:border-slate-800/80 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#64748B] dark:text-slate-400">{p.specifications[0]?.parameter}:</span>
                        <span className="font-semibold text-[#0F2A43] dark:text-slate-200">{p.specifications[0]?.value} {p.specifications[0]?.unit}</span>
                      </div>
                      {p.specifications[1] && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-[#64748B] dark:text-slate-400">{p.specifications[1]?.parameter}:</span>
                          <span className="font-semibold text-[#0F2A43] dark:text-slate-200">{p.specifications[1]?.value} {p.specifications[1]?.unit}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Area */}
                  <div className="pt-4 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center gap-3">
                    <Link
                      href={`/products/${p.slug}`}
                      className="flex-1 py-2 text-center text-xs font-semibold text-[#10233F] dark:text-slate-200 bg-white dark:bg-[#16233B] hover:bg-[#F8FAFC] dark:hover:bg-[#1E3050] border border-[#E2E8F0] dark:border-slate-700/80 rounded-lg transition-colors"
                    >
                      Inspect Specs
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        const event = new CustomEvent('open-quote-modal', { detail: { product: `${p.model} - ${p.name}` } });
                        window.dispatchEvent(event);
                      }}
                      className="flex-1 py-2 text-center text-xs font-semibold text-white bg-[#1769E0] hover:bg-[#1258BF] rounded-lg transition-colors shadow-xs"
                    >
                      Request RFQ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full Catalog Banner */}
          <div className="mt-10 p-5 bg-white dark:bg-[#111C2E] rounded-xl border border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left" data-aos="fade-up">
            <div>
              <h4 className="text-sm font-semibold text-[#0F2A43] dark:text-slate-100">
                Looking for specialized analytical chromatography, ultrasound transducers, or ICU ventilators?
              </h4>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Our complete institutional catalog contains detailed engineering parameters, manuals, and accessories.
              </p>
            </div>
            <Link
              href="/products"
              className="px-5 py-2.5 bg-[#0F2A43] dark:bg-[#1769E0] hover:bg-[#163A5C] dark:hover:bg-[#1258BF] text-white rounded-lg text-xs font-semibold shrink-0 inline-flex items-center gap-2 transition-colors"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 4. ENGINEERING SERVICES (Editorial Asymmetric Layout) */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#0B121E] border-b border-[#E2E8F0] dark:border-slate-800/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Left Column: Engineering Philosophy & Technical Standards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5" />
                <span>Lifecycle Support Protocols</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2A43] dark:text-white tracking-tight">
                Biomedical Engineering &amp; Technical Field Services
              </h2>

              <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
                Healthcare facilities cannot tolerate uncalibrated diagnostic readings or device downtime. Our factory-trained biomedical field engineers provide turnkey physical installation, certified calibration, and comprehensive maintenance agreements.
              </p>

              {/* Commissioning Checklist Box */}
              <div className="p-5 bg-[#F8FAFC] dark:bg-[#0F1A2E] rounded-xl border border-[#E2E8F0] dark:border-slate-800 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0F2A43] dark:text-slate-200 block">
                  Turnkey Commissioning Deliverables
                </span>
                <ul className="space-y-2.5 text-xs text-[#64748B] dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Site environmental survey &amp; electrical grounding audit (IEC 62353)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Installation Qualification (IQ) &amp; Operational Qualification (OQ) protocols</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>NIST-traceable baseline calibration and uncertainty calculation</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>Clinical user training and first-line maintenance documentation</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] hover:text-[#1258BF] dark:hover:text-blue-400"
                >
                  <span>Review Complete Scope of Engineering Delivery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: 6 Structured Service Deliverables */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {engineeringServices.map((svc, idx) => {
                const IconComp = svc.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#111C2E] hover:border-[#CBD5E1] dark:hover:border-blue-500/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-[#F0F6FE] dark:bg-[#162742] text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center mb-3">
                        <IconComp className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="text-sm font-semibold text-[#0F2A43] dark:text-slate-100 mb-1.5">
                        {svc.title}
                      </h3>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed font-normal">
                        {svc.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-[#1769E0] dark:text-[#38BDF8] block">
                        {svc.sla}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* 5. BUILT FOR HEALTHCARE OPERATIONS (Quality & Verified Institutional References) */}
      <section className="py-14 sm:py-18 bg-[#F8FAFC] dark:bg-[#0D1525] border-b border-[#E2E8F0] dark:border-slate-800/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] uppercase tracking-wider block mb-2">
              Regulatory Standards &amp; Quality Framework
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2A43] dark:text-white tracking-tight">
              Built for High-Acuity Healthcare Operations
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-2 font-normal">
              Every equipment package supplied is backed by international clinical compliance standards and verified service certifications.
            </p>
          </div>

          {/* 4 Regulatory Framework Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {complianceStandards.map((std, idx) => (
              <div
                key={idx}
                className="p-5 bg-white dark:bg-[#111C2E] rounded-xl border border-[#E2E8F0] dark:border-slate-800 space-y-2 shadow-xs"
              >
                <span className="text-xs font-mono font-semibold text-[#1769E0] dark:text-[#38BDF8] block">
                  {std.code}
                </span>
                <h3 className="text-sm font-semibold text-[#0F2A43] dark:text-slate-100 block">
                  {std.title}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed font-normal">
                  {std.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Verified Regional Partners & References */}
          <div className="pt-8 border-t border-[#E2E8F0] dark:border-slate-800/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400 block">
                  Regional Healthcare Deployments
                </span>
                <h3 className="text-base font-semibold text-[#0F2A43] dark:text-white">
                  Trusted by Referral Hospitals &amp; Diagnostic Facilities
                </h3>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-md font-normal">
                Supplying verified biomedical instrumentation, preventive maintenance contracts, and technical support across East Africa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {verifiedPartners.map((client, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white dark:bg-[#111C2E] rounded-xl border border-[#E2E8F0] dark:border-slate-800 flex flex-col items-center justify-between text-center shadow-xs"
                >
                  <div className="h-14 w-full flex items-center justify-center p-2 mb-2 bg-slate-50 dark:bg-white/95 rounded-lg border border-slate-100 dark:border-white/10">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-h-10 max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[#0F2A43] dark:text-slate-100 leading-snug">
                      {client.name}
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5 block font-normal">
                      {client.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. TRANSPARENT B2B PROCUREMENT JOURNEY */}
      <section className="py-14 sm:py-18 bg-white dark:bg-[#0B121E] border-b border-[#E2E8F0] dark:border-slate-800/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] uppercase tracking-wider block mb-2">
              Procurement Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F2A43] dark:text-white tracking-tight">
              Structured Equipment Acquisition &amp; SLA Lifecycle
            </h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1.5 font-normal">
              A transparent, audited procurement process from technical sizing to clinical handover.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Technical Sizing', desc: 'Clinical requirements, patient capacity, and power/gas specification assessment.' },
              { step: '02', title: 'Formal RFQ Proposal', desc: 'Detailed commercial proforma with warranty tiers and spare parts schedules.' },
              { step: '03', title: 'Site Readiness & Delivery', desc: 'Pre-installation survey, site preparation, and bonded logistics staging.' },
              { step: '04', title: 'IQ/OQ/PQ Validation', desc: 'Physical setup, electrical safety audit (IEC 62353), and operator training.' },
              { step: '05', title: 'Lifecycle Maintenance', desc: 'Routine preventative servicing, NIST calibration, and emergency dispatch.' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#111C2E] hover:dark:border-blue-500/40 transition-all space-y-2 relative"
              >
                <span className="text-xs font-mono font-semibold text-[#1769E0] dark:text-[#38BDF8] block">
                  {step.step}
                </span>
                <h3 className="text-sm font-semibold text-[#0F2A43] dark:text-slate-100 block">
                  {step.title}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. CORPORATE CONVERSION BANNER */}
      <section className="py-12 sm:py-16 bg-white dark:bg-[#0B121E]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 bg-gradient-to-br from-[#0F2A43] via-[#12365A] to-[#0A1E33] dark:from-[#112338] dark:via-[#163354] dark:to-[#0D1B2D] text-white rounded-2xl flex flex-col md:flex-row justify-between items-center gap-8 border border-[#163A5C] dark:border-blue-500/30 shadow-subtle dark:shadow-[0_4px_30px_rgba(23,105,224,0.15)] relative overflow-hidden">
            
            {/* Subtle glow circle */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 max-w-2xl text-center md:text-left relative z-10">
              <span className="text-xs font-semibold text-[#13A8C7] dark:text-[#38BDF8] uppercase tracking-wider block">
                Biomedical Engineering Requisition Desk
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Equip Your Healthcare Facility With Certified Biomedical Systems
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Consult with our biomedical engineering specialists or submit an official quotation requisition. Our sales and engineering desk responds within 2 to 4 business hours.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3.5 shrink-0 relative z-10">
              <button
                type="button"
                onClick={() => {
                  const event = new CustomEvent('open-quote-modal', { detail: {} });
                  window.dispatchEvent(event);
                }}
                className="px-6 py-3 bg-[#1769E0] hover:bg-[#1258BF] text-white rounded-lg font-semibold text-xs sm:text-sm transition-colors shadow-xs"
              >
                Request a Quotation (RFQ)
              </button>
              <Link
                href="/contact"
                className="px-6 py-3 bg-white/10 hover:bg-white/15 dark:bg-white/10 dark:hover:bg-white/20 text-white border border-white/20 rounded-lg font-semibold text-xs sm:text-sm backdrop-blur-xs transition-colors"
              >
                Consult an Engineer
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
