'use client';

import React, { useEffect, useState } from 'react';
import {
  FileEdit,
  Save,
  CheckCircle2,
  Globe,
  Award,
  Layers,
  Phone,
  Building2,
  Wrench,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  RefreshCw,
  X,
  Target,
  Eye,
  Check,
  Gauge,
  AlertTriangle,
  Cpu,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface ServiceItem {
  id: string;
  title: string;
  tag: string;
  iconName: string;
  desc: string;
  deliverables: string[];
  sla: string;
}

const defaultServices: ServiceItem[] = [
  {
    id: 'installation',
    title: 'Equipment Installation & Commissioning',
    tag: 'Certified Biomedical Engineers',
    iconName: 'Wrench',
    desc: 'End-to-end site preparation, environmental checks, hardware assembly, electrical safety testing, and formal IQ/OQ/PQ validation according to manufacturer protocols.',
    deliverables: [
      'Site readiness inspection & electrical safety auditing (IEC 62353)',
      'Unboxing, rigging, and precision mechanical assembly',
      'Integration into hospital infrastructure (MGPS, LAN, PACS, LIS/HIS)',
      'Baseline calibration, software setup, and protocol verification',
      'Handover sign-off dossier with official Commissioning Certificates'
    ],
    sla: 'On-site deployment within 24-48 hours of site readiness'
  },
  {
    id: 'amc-cmc',
    title: 'Preventive Maintenance (AMC & CMC)',
    tag: 'Continuous Hospital Availability',
    iconName: 'ShieldCheck',
    desc: 'Annual Maintenance Contracts (AMC) and Comprehensive Maintenance Contracts (CMC) designed to eliminate unexpected breakdowns and protect institutional capital investment.',
    deliverables: [
      'Scheduled quarterly or bi-annual on-site biomedical servicing',
      'Detailed 45-point checklist covering pneumatic and electrical tolerances',
      'Proactive renewal of filters, vacuum seals, and aging battery cells',
      'Priority emergency call-out dispatch with guaranteed turnaround',
      'Digital asset health reports logged for accreditation audits'
    ],
    sla: 'Guaranteed rapid response for critical ICU / operating theatre devices'
  },
  {
    id: 'calibration',
    title: 'Biomedical Calibration & Metrology',
    tag: 'NIST & ISO/IEC Traceable',
    iconName: 'Gauge',
    desc: 'Precision testing and calibration utilizing certified biomedical test analyzers to guarantee diagnostic accuracy and regulatory audit readiness.',
    deliverables: [
      'Defibrillator energy & pacer rate calibration',
      'Ventilator flow, pressure, volume, and oxygen sensor calibration',
      'Patient monitor NIBP, SpO2, and ECG simulator validation',
      'Laboratory centrifuge speed (tachometer) and temperature calibration',
      'Traceable Biomedical Calibration Certificates with uncertainty calculations'
    ],
    sla: 'Turnaround within 24-48 hours on-site'
  },
  {
    id: 'breakdown-repair',
    title: '24/7 Breakdown & Emergency Repair',
    tag: 'Emergency Response Helpline',
    iconName: 'AlertTriangle',
    desc: 'Rapid on-site emergency troubleshooting, board-level component rework, and fault diagnosis by senior biomedical field engineers.',
    deliverables: [
      '24/7 emergency dispatch helpline manned by biomedical specialists',
      'Rapid root-cause fault diagnosis on hydraulic, pneumatic, and electronic circuits',
      'Board-level component rework and micro-soldering repairs',
      'Temporary standby loaner equipment available for critical ICU devices',
      'Comprehensive post-repair verification and safety re-certification'
    ],
    sla: 'Immediate technician consultation and rapid regional dispatch'
  },
  {
    id: 'spare-parts',
    title: 'Servicing & Genuine OEM Spare Parts',
    tag: 'Manufacturer Certified Spares',
    iconName: 'Cpu',
    desc: 'Direct access to verified OEM replacement boards, sensors, valves, pumps, tubes, and batteries with a 12-month manufacturer replacement warranty.',
    deliverables: [
      'Strategic inventory of critical replacement parts in regional warehouses',
      'Temperature-controlled storage for sensitive probes and diagnostic accessories',
      '100% genuine manufacturer-certified parts with batch tracking',
      '12-month full replacement warranty on all installed spares',
      'Express courier delivery across regional health facilities'
    ],
    sla: 'Same-day dispatch for in-stock components'
  },
  {
    id: 'training',
    title: 'User Training & Biomedical Certification',
    tag: 'Competency Programs',
    iconName: 'GraduationCap',
    desc: 'Comprehensive operational and biomedical maintenance training for doctors, nurses, laboratory technicians, and hospital engineering staff.',
    deliverables: [
      'Clinical user training on device settings, alarms, and patient application',
      'Laboratory technician training on reagent handling and daily QC routines',
      'First-line biomedical maintenance training for internal hospital engineers',
      'Interactive hands-on practical workshops with simulated failure scenarios',
      'Individual Certificates of Competency issued to all participants'
    ],
    sla: 'Flexible scheduling for day, evening, or weekend clinical shifts'
  }
];

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'services' | 'about' | 'company' | 'contact' | 'certifications'>('hero');

  // Hero State
  const [heroHeadline, setHeroHeadline] = useState('Advanced Medical & Laboratory Equipment Solutions');
  const [heroSubhead, setHeroSubhead] = useState(
    'Medlab Innovate Engineering Ltd delivers ISO 13485 certified critical care devices, diagnostic analyzers, turnkey cleanroom engineering, and 24/7 biomedical technical support.'
  );
  const [heroCta1, setHeroCta1] = useState('Explore Equipment Catalog');
  const [heroCta2, setHeroCta2] = useState('Request Official Requisition');

  // About State
  const [mission, setMission] = useState(
    'To bridge clinical necessity with rigorous biomedical precision, providing hospitals and pathology laboratories with reliable, validated equipment infrastructure that safeguards patient care.'
  );
  const [vision, setVision] = useState(
    'To stand as the most dependable medical engineering and analytical instrumentation partner across emerging and developed healthcare ecosystems worldwide.'
  );
  const [values, setValues] = useState([
    { title: 'Engineering first', desc: 'We support every system from site readiness and installation to maintenance and repair.' },
    { title: 'Reliable delivery', desc: 'Clear processes, quality equipment, and responsive technical support keep operations moving.' },
    { title: 'Built for the region', desc: 'Nairobi-based teams supporting hospitals and laboratories across East Africa.' },
  ]);

  // Services State
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isNewService, setIsNewService] = useState(false);
  const [serviceDeliverableInput, setServiceDeliverableInput] = useState('');

  // Company State
  const [companyName, setCompanyName] = useState('Medlab Innovate Engineering Ltd');
  const [regNumber, setRegNumber] = useState('PVT-EDUMG7');
  const [kraPin, setKraPin] = useState('P051982736Z');
  const [coverageArea, setCoverageArea] = useState('Kenya & East African Regional Healthcare Systems');
  const [foundedYear, setFoundedYear] = useState('2018');

  // Contact State
  const [contactAddress, setContactAddress] = useState(
    'Around Thika Road / Baba Dogo / Outer Ring Road, Nairobi, Kenya'
  );
  const [contactPhone, setContactPhone] = useState('+254 142 808755');
  const [contactWhatsapp, setContactWhatsapp] = useState('+254 745 662 988');
  const [contactEmail, setContactEmail] = useState('info@medlabinnovate.co.ke');
  const [contactHours, setContactHours] = useState('Monday - Friday: 08:00 - 18:00 GMT | Critical ICU Support: 24/7/365');

  // Certifications State
  const [certificationsList, setCertificationsList] = useState([
    { standard: 'ISO 13485:2016', scope: 'Medical Devices Quality Management Systems', status: 'Audited & Verified' },
    { standard: 'IEC 62353', scope: 'Medical Electrical Equipment Periodic Safety Testing', status: 'Compliant Protocol' },
    { standard: 'ISO/IEC 17025', scope: 'Testing & Calibration Biomedical Laboratories', status: 'Traceable Standards' },
    { standard: 'CE-IVD & FDA', scope: 'In Vitro Diagnostic & Clinical Device Compliance', status: 'Active Documentation' },
  ]);

  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCMS();
  }, []);

  const loadCMS = async () => {
    setLoading(true);
    try {
      const res = await api.getCMS();
      const data = res.data || {};
      
      // Hero
      if (data.hero) {
        if (data.hero.headline) setHeroHeadline(data.hero.headline);
        if (data.hero.subhead) setHeroSubhead(data.hero.subhead);
        if (data.hero.cta1) setHeroCta1(data.hero.cta1);
        if (data.hero.cta2) setHeroCta2(data.hero.cta2);
      }
      
      // About
      if (data.about) {
        if (data.about.mission) setMission(data.about.mission);
        if (data.about.vision) setVision(data.about.vision);
        if (Array.isArray(data.about.values)) setValues(data.about.values);
      }

      // Services
      if (Array.isArray(data.services) && data.services.length > 0) {
        setServices(data.services);
      }

      // Company
      if (data.company) {
        if (data.company.name) setCompanyName(data.company.name);
        if (data.company.regNumber) setRegNumber(data.company.regNumber);
        if (data.company.kraPin) setKraPin(data.company.kraPin);
        if (data.company.coverageArea) setCoverageArea(data.company.coverageArea);
        if (data.company.foundedYear) setFoundedYear(data.company.foundedYear);
      }

      // Contact
      if (data.contact) {
        if (data.contact.address) setContactAddress(data.contact.address);
        if (data.contact.phone) setContactPhone(data.contact.phone);
        if (data.contact.whatsapp) setContactWhatsapp(data.contact.whatsapp);
        if (data.contact.email) setContactEmail(data.contact.email);
        if (data.contact.hours) setContactHours(data.contact.hours);
      }

      // Certifications
      if (Array.isArray(data.certifications) && data.certifications.length > 0) {
        setCertificationsList(data.certifications);
      }
    } catch {
      setToast('Unable to load saved CMS content.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      let payload: any = {};
      if (activeTab === 'hero') {
        payload = { headline: heroHeadline, subhead: heroSubhead, cta1: heroCta1, cta2: heroCta2 };
        await api.updateCMS('hero', payload);
      } else if (activeTab === 'about') {
        payload = { mission, vision, values };
        await api.updateCMS('about', payload);
      } else if (activeTab === 'services') {
        await api.updateCMS('services', services);
      } else if (activeTab === 'company') {
        payload = { name: companyName, regNumber, kraPin, coverageArea, foundedYear };
        await api.updateCMS('company', payload);
      } else if (activeTab === 'contact') {
        payload = { address: contactAddress, phone: contactPhone, whatsapp: contactWhatsapp, email: contactEmail, hours: contactHours };
        await api.updateCMS('contact', payload);
      } else if (activeTab === 'certifications') {
        await api.updateCMS('certifications', certificationsList);
      }

      setToast(`Changes for '${activeTab}' successfully deployed to live public portal.`);
    } catch (err: any) {
      setToast(err.message || 'Error deploying CMS updates.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  // Service Modal helpers
  const handleOpenEditService = (srv: ServiceItem) => {
    setIsNewService(false);
    setEditingService({ ...srv });
  };

  const handleOpenNewService = () => {
    setIsNewService(true);
    setEditingService({
      id: `service-${Date.now()}`,
      title: '',
      tag: 'Biomedical Service',
      iconName: 'Wrench',
      desc: '',
      deliverables: [],
      sla: 'Response within 24 hours'
    });
  };

  const handleSaveServiceModal = () => {
    if (!editingService || !editingService.title.trim()) return;

    if (isNewService) {
      const updated = [...services, editingService];
      setServices(updated);
      api.updateCMS('services', updated).catch(() => {});
    } else {
      const updated = services.map((s) => (s.id === editingService.id ? editingService : s));
      setServices(updated);
      api.updateCMS('services', updated).catch(() => {});
    }
    setEditingService(null);
    setToast('Service updated in CMS catalog.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteService = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    api.updateCMS('services', updated).catch(() => {});
    setToast('Service removed.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddDeliverable = () => {
    if (!serviceDeliverableInput.trim() || !editingService) return;
    setEditingService({
      ...editingService,
      deliverables: [...(editingService.deliverables || []), serviceDeliverableInput.trim()]
    });
    setServiceDeliverableInput('');
  };

  const handleRemoveDeliverable = (idx: number) => {
    if (!editingService) return;
    const next = [...editingService.deliverables];
    next.splice(idx, 1);
    setEditingService({ ...editingService, deliverables: next });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <FileEdit className="w-5 h-5" />
            </div>
            <span>Website Content Management System (CMS)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed ml-13">
            Manage public website pages, services catalog, mission, company profile, contact channels, and accreditations in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition"
          >
            <span>Preview Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={() => handleSaveAll()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm shadow-sky-600/20 transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 stroke-[2.5]" />}
            <span>{saving ? 'Publishing...' : 'Publish Section'}</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Curvy Pill-Style Navigation Tabs */}
      <div className="p-2 bg-slate-100/70 rounded-3xl flex items-center gap-2 overflow-x-auto border border-slate-200/60 shadow-2xs">
        {[
          { key: 'hero', label: 'Homepage Hero', icon: Globe },
          { key: 'services', label: 'Engineering Services', icon: Wrench },
          { key: 'about', label: 'About Us & Mission', icon: Target },
          { key: 'company', label: 'Company Profile', icon: Building2 },
          { key: 'contact', label: 'Contact Coordinates', icon: Phone },
          { key: 'certifications', label: 'Certifications', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-2xl whitespace-nowrap transition flex items-center gap-2 text-xs font-bold cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* TAB 1: HOMEPAGE HERO */}
        {activeTab === 'hero' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Homepage Hero Banner</h2>
                <p className="text-xs text-slate-500">Configure the primary hero headline and main call to action buttons on the home page.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Main Headline (H1)
                </label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Sub-Headline Narrative
                </label>
                <textarea
                  rows={3}
                  value={heroSubhead}
                  onChange={(e) => setHeroSubhead(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroCta1}
                    onChange={(e) => setHeroCta1(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroCta2}
                    onChange={(e) => setHeroCta2(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SERVICES MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Biomedical Engineering &amp; Healthcare Services</h2>
                <p className="text-xs text-slate-500">Add, edit, remove, and configure service packages displayed on the public services page.</p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewService}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm shadow-sky-600/20 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60 uppercase tracking-wider">
                        {srv.tag || 'Service'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditService(srv)}
                          className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white hover:bg-sky-50 text-slate-500 hover:text-sky-600 flex items-center justify-center transition cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{srv.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{srv.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="text-slate-500 font-semibold">
                      Deliverables: <span className="text-slate-900 font-bold">{srv.deliverables?.length || 0} items</span>
                    </div>
                    <div className="text-slate-500 truncate">
                      SLA: <span className="text-emerald-700 font-semibold">{srv.sla}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ABOUT US & MISSION */}
        {activeTab === 'about' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Corporate Purpose, Mission &amp; Vision</h2>
              <p className="text-xs text-slate-500">Update company mission statements and core values displayed on the public About page.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Official Mission Statement
                </label>
                <textarea
                  rows={3}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Institutional Vision 2030
                </label>
                <textarea
                  rows={3}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Corporate Values</label>
                  <button
                    type="button"
                    onClick={() => setValues([...values, { title: 'New Value', desc: 'Description of value' }])}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                  >
                    + Add Value
                  </button>
                </div>

                <div className="space-y-3">
                  {values.map((v, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={v.title}
                          onChange={(e) => {
                            const copy = [...values];
                            copy[idx].title = e.target.value;
                            setValues(copy);
                          }}
                          placeholder="Title"
                          className="px-3 py-2 rounded-xl border border-slate-200/80 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                        <input
                          type="text"
                          value={v.desc}
                          onChange={(e) => {
                            const copy = [...values];
                            copy[idx].desc = e.target.value;
                            setValues(copy);
                          }}
                          placeholder="Description"
                          className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200/80 text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...values];
                          copy.splice(idx, 1);
                          setValues(copy);
                        }}
                        className="w-8 h-8 rounded-xl border border-slate-200/60 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPANY INFORMATION */}
        {activeTab === 'company' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Company Registration &amp; Legal Profile</h2>
              <p className="text-xs text-slate-500">Corporate identifiers, tax registrations, and institutional standing.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Registered Legal Entity</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Company Registration Number</label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">KRA PIN / Tax Certificate</label>
                <input
                  type="text"
                  value={kraPin}
                  onChange={(e) => setKraPin(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Geographic Coverage Area</label>
                <input
                  type="text"
                  value={coverageArea}
                  onChange={(e) => setCoverageArea(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT COORDINATES */}
        {activeTab === 'contact' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Headquarters Coordinates &amp; Emergency Channels</h2>
              <p className="text-xs text-slate-500">Contact information displayed across public header, footer, contact page, and tender dossiers.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Physical Facility Address</label>
                <input
                  type="text"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">General Office Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">WhatsApp Business Hotline</label>
                  <input
                    type="text"
                    value={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Correspondence Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Operating Hours &amp; ICU 24/7 Policy</label>
                <input
                  type="text"
                  value={contactHours}
                  onChange={(e) => setContactHours(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CERTIFICATIONS */}
        {activeTab === 'certifications' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Regulatory Standards &amp; Quality Accreditations</h2>
                <p className="text-xs text-slate-500">Quality management compliance standards displayed to healthcare clients and procurement boards.</p>
              </div>
              <button
                type="button"
                onClick={() => setCertificationsList([...certificationsList, { standard: 'Standard Name', scope: 'Scope description', status: 'Compliant' }])}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                + Add Certification
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {certificationsList.map((cert, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={cert.standard}
                      onChange={(e) => {
                        const copy = [...certificationsList];
                        copy[idx].standard = e.target.value;
                        setCertificationsList(copy);
                      }}
                      className="font-bold text-xs sm:text-sm text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 flex-1 mr-2 outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...certificationsList];
                        copy.splice(idx, 1);
                        setCertificationsList(copy);
                      }}
                      className="w-8 h-8 rounded-xl border border-slate-200/60 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={cert.scope}
                    onChange={(e) => {
                      const copy = [...certificationsList];
                      copy[idx].scope = e.target.value;
                      setCertificationsList(copy);
                    }}
                    placeholder="Scope of certification"
                    className="w-full text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200/80 outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <input
                    type="text"
                    value={cert.status}
                    onChange={(e) => {
                      const copy = [...certificationsList];
                      copy[idx].status = e.target.value;
                      setCertificationsList(copy);
                    }}
                    placeholder="Audit status"
                    className="w-full text-xs font-bold text-emerald-700 bg-white px-3 py-2 rounded-xl border border-slate-200/80 outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Edit or Add Service */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <span className="text-sm font-bold text-slate-900">
                {isNewService ? 'Create Biomedical Service' : `Edit: ${editingService.title}`}
              </span>
              <button
                onClick={() => setEditingService(null)}
                className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Service Title</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  placeholder="e.g. Biomedical Calibration & Metrology"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-medium rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Badge / Tag</label>
                  <input
                    type="text"
                    value={editingService.tag}
                    onChange={(e) => setEditingService({ ...editingService, tag: e.target.value })}
                    placeholder="e.g. Certified Biomedical Engineers"
                    className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">SLA Guarantee</label>
                  <input
                    type="text"
                    value={editingService.sla}
                    onChange={(e) => setEditingService({ ...editingService, sla: e.target.value })}
                    placeholder="e.g. Turnaround within 24-48 hours"
                    className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Comprehensive Description</label>
                <textarea
                  rows={3}
                  value={editingService.desc}
                  onChange={(e) => setEditingService({ ...editingService, desc: e.target.value })}
                  placeholder="Service overview and scope..."
                  className="w-full px-4 py-2.5 text-xs leading-relaxed rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Key Deliverables</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={serviceDeliverableInput}
                    onChange={(e) => setServiceDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                    placeholder="Add deliverable point..."
                    className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-2xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {editingService.deliverables?.map((del, dIdx) => (
                    <div key={dIdx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 text-xs">
                      <span className="text-slate-700 font-medium">• {del}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(dIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/75">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200/80 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveServiceModal}
                className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm shadow-sky-600/20 cursor-pointer"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
