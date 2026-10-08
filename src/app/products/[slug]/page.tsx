'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api, fallbackProducts } from '@/lib/api';
import { IProduct } from '@/lib/types';
import { 
  ShieldCheck, 
  Truck, 
  Wrench, 
  Download, 
  CheckCircle2, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  GraduationCap, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getProductBySlug(slug);
        if (res.data) {
          setProduct(res.data);
          // Fetch related products in the same category
          const relatedRes = await api.getProducts(`?category=${encodeURIComponent(res.data.category)}&limit=3`);
          if (relatedRes.data) {
            setRelatedProducts(relatedRes.data.filter((p: IProduct) => p._id !== res.data._id));
          }
        }
      } catch (err) {
        console.warn('Could not load from API, searching fallbacks:', err);
        const found = fallbackProducts.find((p) => p.slug === slug);
        if (found) {
          setProduct(found);
          setRelatedProducts(fallbackProducts.filter((p) => p.category === found.category && p._id !== found._id));
        }
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadData();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0B121E] transition-colors">
        <div className="mx-auto max-w-[1400px] animate-pulse px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-3 w-28 rounded-full bg-[#DCE7F2] dark:bg-slate-800" />
            <div className="h-3 w-2 rounded-full bg-[#DCE7F2] dark:bg-slate-800" />
            <div className="h-3 w-40 rounded-full bg-[#E6EEF5] dark:bg-slate-700" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <div className="flex h-[320px] items-center justify-center rounded-3xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] sm:h-[440px]">
                <div className="h-40 w-40 rounded-2xl bg-[#DCE7F2] dark:bg-slate-800 sm:h-56 sm:w-56" />
              </div>
              <div className="flex gap-2.5">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-[72px] w-[72px] rounded-xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] sm:h-20 sm:w-20" />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-4 sm:grid-cols-3 sm:gap-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="h-3 w-16 rounded bg-[#DCE7F2] dark:bg-slate-800" />
                    <div className="h-3 w-24 rounded bg-[#E6EEF5] dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 lg:col-span-6">
              <div className="rounded-3xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-5 sm:p-7">
                <div className="h-3 w-28 rounded bg-[#BFDCFA] dark:bg-blue-900" />
                <div className="mt-4 h-9 w-4/5 rounded-lg bg-[#DCE7F2] dark:bg-slate-800" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-[#E6EEF5] dark:bg-slate-700" />
                  <div className="h-3 w-3/4 rounded bg-[#E6EEF5] dark:bg-slate-700" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-4">
                <div className="space-y-2">
                  <div className="h-2.5 w-36 rounded bg-[#E6EEF5] dark:bg-slate-700" />
                  <div className="h-4 w-48 rounded bg-[#DCE7F2] dark:bg-slate-800" />
                </div>
                <div className="h-7 w-24 rounded bg-[#E6EEF5] dark:bg-slate-700" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="h-12 flex-1 rounded-xl bg-[#1769E0]" />
                <div className="h-12 flex-1 rounded-xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#0F2A43] dark:text-white tracking-tight">Equipment Specification Not Found</h2>
        <p className="text-xs text-[#64748B] dark:text-slate-400">The requested equipment model does not exist or has been archived.</p>
        <Link href="/products" className="inline-block px-5 py-2.5 bg-[#1769E0] hover:bg-[#1258BF] text-white rounded-lg text-xs font-semibold shadow-xs transition">
          Return to Equipment Catalog
        </Link>
      </div>
    );
  }

  const primaryImage = product.images[activeImageIndex]?.url || '/images/hero_banner.jpg';

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B121E] text-[#10233F] dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      
      {/* Breadcrumb Navigation */}
      <nav className="mb-5 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs text-[#64748B] dark:text-slate-400 no-scrollbar sm:text-sm">
        <Link href="/products" className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-[#1769E0] dark:text-[#38BDF8] transition-colors hover:text-[#1258BF]">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to catalog</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] dark:text-slate-600 shrink-0" />
        <span className="text-[#0F2A43] dark:text-white font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main Product Presentation (Gallery + Commercial Specs) */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 mb-8">
        
        {/* Left Column: Gallery & Verified Assurances */}
        <div className="space-y-4 lg:col-span-6">
          <div className="group relative flex h-[320px] items-center justify-center overflow-hidden rounded-3xl border border-[#DCE7F2] dark:border-slate-800 bg-gradient-to-br from-white via-[#F4F8FC] to-[#EAF3FB] dark:from-[#111C2E] dark:via-[#0F172A] dark:to-[#0B1320] p-6 shadow-sm sm:h-[440px]">
            <img 
              src={primaryImage} 
              alt={product.name} 
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02] relative z-10" 
            />
            <span className="absolute bottom-4 right-4 rounded-full border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400 backdrop-blur-sm z-10">
              Product preview
            </span>
            {/* Clean Floating Model Badge */}
            <div className="absolute left-4 top-4 flex items-center gap-1.5 z-10">
              <span className="rounded-md bg-[#0F2A43] dark:bg-[#1769E0] px-2.5 py-1 font-mono text-[11px] font-bold text-white shadow-xs">
                {product.model}
              </span>
              <span className="px-2.5 py-1 bg-white/90 dark:bg-[#16233B]/90 backdrop-blur-sm text-[#0F2A43] dark:text-slate-100 text-[11px] font-semibold rounded-md border border-[#E2E8F0] dark:border-slate-700/80">
                {product.brand}
              </span>
            </div>
          </div>

          {/* Multiple Image Thumbnails if available */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-[#F8FAFC] dark:bg-[#0B1320] p-2 transition-all sm:h-20 sm:w-20 ${
                    activeImageIndex === idx 
                      ? 'border-[#1769E0] ring-2 ring-[#1769E0]/20 bg-white dark:bg-[#111C2E] shadow-xs' 
                      : 'border-[#E2E8F0] dark:border-slate-800 opacity-75 hover:opacity-100 hover:bg-white dark:hover:bg-[#111C2E]'
                  }`}
                >
                  <img src={img.url} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Technical Assurances Strip */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-4 text-xs shadow-xs sm:grid-cols-3 sm:gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#0F2A43] dark:text-white font-semibold">Warranty</strong>
                <span className="text-[11px] text-[#64748B] dark:text-slate-400 leading-tight block mt-0.5">{product.warranty}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#0F2A43] dark:text-white font-semibold">Lead Time</strong>
                <span className="text-[11px] text-[#64748B] dark:text-slate-400 leading-tight block mt-0.5">{product.leadTime || '3-7 Business Days'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Wrench className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#0F2A43] dark:text-white font-semibold">Validation</strong>
                <span className="text-[11px] text-[#64748B] dark:text-slate-400 leading-tight block mt-0.5">Turnkey IQ/OQ/PQ Setup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Technical Overview, Procurement Tiers, RFQ CTAs */}
        <div className="space-y-6 lg:col-span-6">
          <div className="rounded-3xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-5 shadow-xs sm:p-7">
            <span className="text-xs font-bold text-[#1769E0] dark:text-[#38BDF8] uppercase tracking-wider block mb-1">
              {product.category}
            </span>
            <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-[#0F2A43] dark:text-white sm:text-4xl">
              {product.name}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#64748B] dark:text-slate-300 font-normal">
              {product.shortDescription}
            </p>
          </div>

          {/* Indicative Procurement Status Box */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-4 shadow-xs">
            <div>
              <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-semibold uppercase tracking-wider block">
                Procurement Classification
              </span>
              <strong className="text-sm sm:text-base text-[#0F2A43] dark:text-white font-bold">
                {product.priceEstimate || 'Official Institutional Quote Required'}
              </strong>
            </div>
            <span className="text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] bg-slate-50 dark:bg-[#16233B] px-3 py-1 rounded border border-[#E2E8F0] dark:border-slate-700/80 shadow-xs">
              Clinical Grade
            </span>
          </div>

          {/* Procurement CTAs */}
          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                const event = new CustomEvent('open-quote-modal', { detail: { product: `${product.model} - ${product.name}` } });
                window.dispatchEvent(event);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1769E0] px-5 py-3.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1258BF] focus:outline-none focus:ring-4 focus:ring-[#1769E0]/20"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Request Formal Proforma (RFQ)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const event = new CustomEvent('open-chat-modal', { detail: { query: `What are the electrical requirements, installation prerequisites, and accessories for ${product.model}?` } });
                window.dispatchEvent(event);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#DCE7F2] dark:border-slate-700 bg-white dark:bg-[#111C2E] hover:bg-[#F8FAFC] dark:hover:bg-[#16253D] px-5 py-3.5 text-xs font-semibold text-[#10233F] dark:text-slate-100 shadow-xs transition-colors focus:outline-none focus:ring-4 focus:ring-[#1769E0]/10"
            >
              <MessageSquare className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
              <span>Ask AI Engineering Advisor</span>
            </button>
          </div>

          {/* Clinical & Operational Overview */}
          <div className="space-y-2 rounded-2xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-5 text-xs shadow-xs">
            <h3 className="font-bold text-[#0F2A43] dark:text-white text-sm">
              Clinical & Engineering Overview
            </h3>
            <p className="text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
              {product.description}
            </p>
          </div>

          {/* Engineering Key Features List */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2.5 rounded-2xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-5 text-xs shadow-xs">
              <h3 className="font-bold text-[#0F2A43] dark:text-white text-sm">
                Engineering Capabilities & Diagnostics
              </h3>
              <ul className="grid grid-cols-1 gap-2">
                {product.features.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[#64748B] dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1769E0] dark:text-[#38BDF8] shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Downloadable Documentation */}
          {product.documents && product.documents.length > 0 && (
            <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800">
              <span className="block text-xs font-bold text-[#0F2A43] dark:text-white mb-2">
                Factory Brochures & Technical Documentation:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {product.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#0B1320] hover:bg-[#F0F6FE] dark:hover:bg-[#16233B] text-[#1769E0] dark:text-[#38BDF8] text-xs font-medium rounded-lg border border-[#E2E8F0] dark:border-slate-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#1769E0] dark:text-[#38BDF8]" />
                    <span>{doc.title} ({doc.size || 'PDF'})</span>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Technical Specifications Table */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] shadow-xs">
        <div className="p-5 sm:p-6 border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0D1525]">
          <h2 className="text-lg font-bold text-[#0F2A43] dark:text-white tracking-tight">
            Factory Technical Specifications
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Verified electrical, physical, and clinical operating tolerances.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white dark:bg-[#0F1A2E] text-[#64748B] dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-[#E2E8F0] dark:border-slate-800">
                <th className="py-3 px-6 w-1/3">Engineering Parameter</th>
                <th className="py-3 px-6">Operational Value</th>
                <th className="py-3 px-6 w-28">Standard Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800/80">
              {product.specifications.map((s, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] dark:hover:bg-[#16233B] transition-colors">
                  <td className="py-3 px-6 font-semibold text-[#0F2A43] dark:text-white">{s.parameter}</td>
                  <td className="py-3 px-6 text-[#10233F] dark:text-slate-200">{s.value}</td>
                  <td className="py-3 px-6 text-[#64748B] dark:text-slate-400 font-mono text-[11px]">{s.unit || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Installation & Training Prerequisites */}
      <section className="mb-8 grid grid-cols-1 gap-6 text-xs md:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-5 shadow-xs sm:p-6">
          <div className="flex items-center gap-2 text-[#0F2A43] dark:text-white font-bold text-sm">
            <Wrench className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
            <span>Site & Facility Pre-Installation Requirements</span>
          </div>
          <p className="text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
            {product.installationRequirements}
          </p>
        </div>

        <div className="space-y-2 rounded-2xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-5 shadow-xs sm:p-6">
          <div className="flex items-center gap-2 text-[#0F2A43] dark:text-white font-bold text-sm">
            <GraduationCap className="w-4 h-4 text-[#1769E0] dark:text-[#38BDF8]" />
            <span>Clinical & Biomedical Maintenance Training</span>
          </div>
          <p className="text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
            {product.trainingRequirements}
          </p>
        </div>
      </section>

      {/* Related Equipment */}
      {relatedProducts.length > 0 && (
        <section className="mt-10 space-y-5 border-t border-[#DCE7F2] dark:border-slate-800 pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1769E0] dark:text-[#38BDF8]">You may also need</p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-[#0F2A43] dark:text-white sm:text-2xl">
                Related equipment
              </h3>
            </div>
            <Link href="/products" className="hidden shrink-0 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] transition-colors hover:text-[#1258BF] sm:inline-flex sm:items-center sm:gap-1">
              Browse catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((rp) => (
              <Link
                key={rp._id}
                href={`/products/${rp.slug}`}
                className="group flex min-h-[330px] flex-col overflow-hidden rounded-2xl border border-[#DCE7F2] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-3 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#AFCFF3] dark:hover:border-blue-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1769E0]/15"
              >
                <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-slate-800 bg-[#F8FBFE] dark:bg-[#0B1320] p-4">
                  <img src={rp.images[0]?.url || '/images/hero_banner.jpg'} alt={rp.name} className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/80 dark:border-slate-700 bg-white/90 dark:bg-[#16233B]/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#1769E0] dark:text-[#38BDF8] shadow-xs">
                    {rp.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-1.5 pb-1 pt-4">
                  <span className="font-mono text-[10px] font-medium tracking-wide text-[#64748B] dark:text-slate-400">{rp.model}</span>
                  <strong className="mt-1.5 line-clamp-2 text-sm font-bold leading-5 text-[#0F2A43] dark:text-slate-100 transition-colors group-hover:text-[#1769E0] dark:group-hover:text-[#38BDF8]">{rp.name}</strong>
                  <div className="mt-auto flex items-center justify-between border-t border-[#E2E8F0] dark:border-slate-800 pt-3">
                    <span className="text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8]">View specifications</span>
                    <ArrowRight className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8] transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] hover:text-[#1258BF] sm:hidden">
            Browse full catalog <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      )}

      </div>
    </main>
  );
}
