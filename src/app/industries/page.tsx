'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  FlaskConical, 
  GraduationCap, 
  Dna, 
  HeartHandshake, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Activity
} from 'lucide-react';

export default function IndustriesPage() {
  const industries = [
    {
      id: 'hospitals',
      title: 'Hospitals & Specialized Medical Centers',
      tagline: 'High-acuity clinical infrastructure engineered for continuous operation',
      icon: Building2,
      badge: 'Critical Care & OR',
      description: 'We equip multi-specialty hospitals, intensive care units (ICU), operating theatres, and emergency departments with verified clinical instrumentation engineered to withstand demanding continuous clinical workflows.',
      challenges: [
        'Equipment downtime risking patient outcomes in intensive care',
        'Strict electrical safety compliance standards (IEC 62353)',
        'Complex integration with hospital telemetry networks and HIS/PACS',
      ],
      solutions: [
        'Turbine-driven ICU mechanical ventilators with high-flow oxygen',
        'Multi-parameter patient monitors with central telemetry stations',
        'Color Doppler ultrasound consoles and mobile digital radiography',
        'Medical gas pipeline systems (MGPS) with automated manifolds',
      ],
      deliverables: [
        'Emergency response dispatch for acute clinical breakdowns',
        'Periodic preventative maintenance and ISO-traceable calibration',
        'Clinical nursing and biomedical staff operational training',
      ]
    },
    {
      id: 'diagnostic-labs',
      title: 'Diagnostic & Pathology Laboratories',
      tagline: 'High-throughput analytical precision with micro-sampling capability',
      icon: FlaskConical,
      badge: 'Pathology & Diagnostics',
      description: 'From central referral pathology labs to point-of-care clinics, we deliver automated analyzers that ensure high diagnostic sensitivity, minimal reagent waste, and direct LIS data interfacing.',
      challenges: [
        'Turnaround time (TAT) pressures with high daily sample volumes',
        'Reagent stability and lot-to-lot calibration consistency',
        'Bio-contamination hazards and sample tracking integrity',
      ],
      solutions: [
        '5-Part differential automated hematology systems with autoloader',
        'Clinical biochemistry analyzers with automated wash stations',
        'Class II Type A2 biosafety cabinets with laminar air flow',
        'High-speed refrigerated microcentrifuges with aerosol-tight rotors',
      ],
      deliverables: [
        'Preventive maintenance contracts with guaranteed operational uptime',
        'Reagent supply agreements and temperature-controlled logistics',
        'Daily Quality Control (QC) setup and technician certifications',
      ]
    },
    {
      id: 'surgical-clinics',
      title: 'Specialist Surgical Clinics & Ambulatory Care',
      tagline: 'Precision surgical tools and theatre monitoring instrumentation',
      icon: Activity,
      badge: 'Surgical Theatres',
      description: 'Equipping day-surgery centers, orthopedic clinics, and specialized ophthalmic and cardiovascular suites with high-performance electrosurgical units, LED surgical lighting, and sterile autoclaves.',
      challenges: [
        'Strict sterilization audit trails and sterile packaging validation',
        'Electrosurgical high-frequency leakage current management',
        'Compact floor plans requiring ergonomic ceiling-mounted pendants',
      ],
      solutions: [
        'Microprocessor electrosurgical generators with bipolar vessel sealing',
        'Multi-joint ceiling operating theatre LED surgical lights',
        'Class B medical autoclaves with vacuum drying cycles',
        'Anesthesia workstations with integrated vaporizers and gas scavenging',
      ],
      deliverables: [
        'Electrical safety leakage testing before surgical theater commissioning',
        'Scheduled autoclave pressure vessel inspections and seal renewals',
        'Loaner units during major preventative maintenance cycles',
      ]
    },
    {
      id: 'research-universities',
      title: 'Research Institutions & Universities',
      tagline: 'Scientific instrumentation empowering academic and scientific research',
      icon: GraduationCap,
      badge: 'Life Sciences & Academia',
      description: 'Empowering academic researchers, doctoral laboratories, and scientific institutes with high-precision analytical instruments, thermal cyclers, and customizable laboratory workflows.',
      challenges: [
        'Research grant budget constraints demanding maximum equipment longevity',
        'Multidisciplinary protocols requiring flexible instrument software',
        'Strict reproducibility standards and data export requirements',
      ],
      solutions: [
        'Real-time quantitative PCR (RT-qPCR) thermal cyclers',
        'Double-beam UV-Vis spectrophotometers with kinetic scanning',
        'Ultra-low temperature (-86°C) biomedical upright freezers',
        'Automated nucleic acid extraction workstations',
      ],
      deliverables: [
        'Educational institution discounting and multi-lab procurement support',
        'Advanced software configuration and open data export standards',
        'Faculty and post-graduate researcher instrument workshops',
      ]
    },
    {
      id: 'pharma-biotech',
      title: 'Pharmaceutical & Biotechnology Facilities',
      tagline: 'GMP/GLP compliant processing systems and cleanroom solutions',
      icon: Dna,
      badge: 'GMP / GLP Cleanroom',
      description: 'Providing validated medical equipment, analytical chromatography systems, and environmental monitoring infrastructure built strictly to WHO-GMP and ISO standards.',
      challenges: [
        'Stringent regulatory audits and mandatory IQ/OQ/PQ validation',
        'Cleanroom particulate and microbiological cross-contamination',
        'Traceability of audit trails and calibration certs',
      ],
      solutions: [
        'High-performance liquid chromatography (HPLC) systems',
        'Automated tablet dissolution testers and stability test chambers',
        'Modular positive/negative pressure cleanroom suites',
        'Continuous environmental particle counters and data loggers',
      ],
      deliverables: [
        'Complete IQ/OQ/PQ validation documentation and execution',
        'Periodic HEPA filter DOP integrity testing and air velocity profiling',
        'Calibration certificates traceable to international NIST standards',
      ]
    },
    {
      id: 'public-healthcare',
      title: 'Public Healthcare Programs & Health Missions',
      tagline: 'Large-scale medical infrastructure deployments for public health',
      icon: HeartHandshake,
      badge: 'Public Health Infrastructure',
      description: 'Partnering with national health ministries, humanitarian agencies, and public healthcare networks to deploy turnkey clinical equipment packages in regional and rural hospitals.',
      challenges: [
        'Ambient temperature variations and fluctuating rural electrical supplies',
        'Logistical challenges and limited local engineering infrastructure',
        'Procurement transparency and multi-tier warranty management',
      ],
      solutions: [
        'Ruggedized solar/hybrid battery-powered clinical diagnostics',
        'Medical isolated power supply (IPS) units and line conditioners',
        'Containerized mobile diagnostic screening laboratories',
        'Consumable supply packs designed for extended shelf-life',
      ],
      deliverables: [
        'Turnkey site delivery, customs clearance, and cold-chain staging',
        'Train-the-trainer engineering programs for local bio-technicians',
        'Multi-year extended service warranties with spare parts stockpiles',
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B121E] text-[#10233F] dark:text-slate-100 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10 sm:space-y-12">
        
        {/* Editorial Header */}
        <div className="border-b border-[#E2E8F0] dark:border-slate-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6" data-aos="fade-up">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#1769E0] dark:bg-[#38BDF8]" />
              <span>Sectors &amp; Clinical Disciplines</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F2A43] dark:text-white tracking-tight">
              Industries We Support
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-300 mt-2 max-w-2xl font-normal leading-relaxed">
              Tailored clinical systems, turnkey biomedical engineering, and continuous SLA maintenance service agreements structured for specialized healthcare environments.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-[#1769E0] hover:bg-[#1258BF] text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
            >
              Consult an Industry Specialist
            </Link>
          </div>
        </div>

        {/* Quick Jump Sector Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none" data-aos="fade-up">
          <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 whitespace-nowrap shrink-0 mr-1">
            Jump to Sector:
          </span>
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <a
                key={ind.id}
                href={`#${ind.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap bg-white dark:bg-[#111C2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-[#1769E0] dark:hover:border-[#38BDF8]/60 hover:text-[#1769E0] dark:hover:text-[#38BDF8] transition-all shadow-xs"
              >
                <Icon className="w-3.5 h-3.5 text-[#1769E0] dark:text-[#38BDF8]" />
                <span>{ind.title.split('&')[0].trim()}</span>
              </a>
            );
          })}
        </div>

        {/* Industries Detailed List */}
        <div className="space-y-8">
          {industries.map((ind, idx) => {
            const IconComp = ind.icon;
            return (
              <div 
                key={ind.id} 
                id={ind.id}
                className="bg-white dark:bg-[#111C2E] rounded-2xl border border-[#E2E8F0] dark:border-slate-800 hover:border-[#CBD5E1] dark:hover:border-blue-500/40 p-6 sm:p-8 shadow-xs transition-all scroll-mt-24"
                data-aos="fade-up"
              >
                {/* Header row */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#E2E8F0] dark:border-slate-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F0F6FE] dark:bg-[#162742] border border-[#E0EDFD] dark:border-blue-500/20 text-[#1769E0] dark:text-[#38BDF8] flex items-center justify-center shrink-0 shadow-xs">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-[#1769E0] dark:text-[#38BDF8] bg-[#F0F6FE] dark:bg-[#162742] px-2.5 py-0.5 rounded-md border border-[#E0EDFD] dark:border-slate-700/80">
                          {ind.badge}
                        </span>
                        <span className="text-xs text-[#64748B] dark:text-slate-400 font-mono font-medium">Sector 0{idx + 1}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#0F2A43] dark:text-white tracking-tight">
                        {ind.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 mt-1 font-normal leading-relaxed">
                        {ind.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/products?category=${encodeURIComponent(ind.title.includes('Hospital') || ind.title.includes('Surgical') ? 'Hospital Medical Equipment' : 'Laboratory Equipment')}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-[#16233B] hover:bg-[#F8FAFC] dark:hover:bg-[#1C2C48] border border-[#E2E8F0] dark:border-slate-700/80 text-[#0F2A43] dark:text-slate-100 transition-colors shadow-xs"
                    >
                      <span>View Relevant Systems</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#1769E0] dark:text-[#38BDF8]" />
                    </Link>
                  </div>
                </div>

                <div className="mt-5 text-[#475569] dark:text-slate-300 leading-relaxed text-xs sm:text-sm font-normal">
                  {ind.description}
                </div>

                {/* 3-Column Detailed Information Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-[#E2E8F0] dark:border-slate-800">
                  
                  {/* Column 1: Specific Challenges */}
                  <div className="bg-[#F8FAFC] dark:bg-[#0B1320] p-5 rounded-xl border border-[#E2E8F0] dark:border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0F2A43] dark:text-slate-200">
                        Operational Challenges
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-[#64748B] dark:text-slate-300">
                      {ind.challenges.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 dark:bg-amber-400/80 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 2: Recommended Systems */}
                  <div className="bg-[#F8FAFC] dark:bg-[#0B1320] p-5 rounded-xl border border-[#E2E8F0] dark:border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1769E0] dark:bg-[#38BDF8] shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0] dark:text-[#38BDF8]">
                        Recommended Modalities
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-[#64748B] dark:text-slate-300">
                      {ind.solutions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 3: Medlab SLA & Deliverables */}
                  <div className="bg-[#F8FAFC] dark:bg-[#0B1320] p-5 rounded-xl border border-[#E2E8F0] dark:border-slate-800/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Medlab SLA &amp; Deliverables
                      </span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-[#64748B] dark:text-slate-300">
                      {ind.deliverables.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Turnkey Procurement & Advisory Banner */}
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-[#0F2A43] via-[#12365A] to-[#0A1E33] dark:from-[#112338] dark:via-[#163354] dark:to-[#0D1B2D] text-white border border-[#163A5C] dark:border-blue-500/30 shadow-subtle dark:shadow-[0_4px_30px_rgba(23,105,224,0.15)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden" data-aos="fade-up">
          {/* Subtle ambient cyan glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#13A8C7] dark:text-[#38BDF8] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#13A8C7] dark:bg-[#38BDF8]" />
              <span>Turnkey Clinical Engineering</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Need Custom Clinical Deployment for Your Facility?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-normal leading-relaxed">
              Our biomedical engineering consultants design turnkey instrument packages, clinical site compliance reviews, and custom SLA agreements for healthcare providers and research institutions.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="px-6 py-3 bg-[#1769E0] hover:bg-[#1258BF] text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs inline-flex items-center gap-2"
            >
              <span>Request Consultation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/products"
              className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Explore Catalog</span>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
