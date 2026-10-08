'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  PackageSearch,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { api, fallbackCategories, fallbackProducts } from '@/lib/api';
import { ICategory, IProduct } from '@/lib/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>(fallbackProducts);
  const [categories, setCategories] = useState<ICategory[]>(fallbackCategories);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerTarget = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadCatalog() {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        let params = `?page=${page}&limit=12&sort=${sortBy}`;
        if (selectedCategory !== 'all') params += `&category=${encodeURIComponent(selectedCategory)}`;
        if (search) params += `&search=${encodeURIComponent(search)}`;

        const res = await api.getProducts(params);
        if (res.data) {
          if (page === 1) {
            setProducts(res.data);
          } else {
            setProducts(prev => {
              const newProducts = res.data.filter((newP: any) => !prev.some((p) => p._id === newP._id));
              return [...prev, ...newProducts];
            });
          }
          setTotalPages(res.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.warn('Error loading catalog, using fallback:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }

    loadCatalog();
  }, [selectedCategory, search, sortBy, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, loadingMore, page, totalPages]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearch('');
    setSortBy('createdAt');
    setPage(1);
  };

  const hasActiveFilters = selectedCategory !== 'all' || search || sortBy !== 'createdAt';

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B121E] text-[#10233F] dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        
        {/* Filter & Search Bar */}
        <section 
          aria-label="Product filters" 
          className="rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#111C2E] p-3 shadow-xs sm:p-5 transition-all" 
          data-aos="fade-up"
        >
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-3">
            <label className="relative block flex-1">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] dark:text-slate-400" />
              <input
                type="search"
                placeholder="Search equipment, model, or clinical need"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-[#CBD5E1] dark:border-slate-700/80 bg-white dark:bg-[#0B1320] py-2.5 pl-10 pr-10 text-sm text-[#10233F] dark:text-slate-100 outline-none transition placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:border-[#1769E0] focus:ring-4 focus:ring-[#1769E0]/10 sm:py-3"
              />
              {search && (
                <button 
                  type="button" 
                  onClick={() => setSearch('')} 
                  aria-label="Clear search" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#64748B] dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 hover:text-[#0F2A43] dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            <div className="grid grid-cols-2 gap-2.5 lg:w-[390px] lg:gap-3">
              <label className="relative">
                <span className="sr-only">Filter by category</span>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} 
                  className="w-full appearance-none rounded-xl border border-[#CBD5E1] dark:border-slate-700/80 bg-white dark:bg-[#0B1320] px-3 py-2.5 pr-8 text-sm font-medium text-[#10233F] dark:text-slate-100 outline-none transition focus:border-[#1769E0] focus:ring-4 focus:ring-[#1769E0]/10 sm:py-3 cursor-pointer"
                >
                  <option value="all" className="dark:bg-[#0B1320]">All categories</option>
                  {categories.map((category) => (
                    <option key={category.name} value={category.name} className="dark:bg-[#0B1320]">
                      {category.name}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] dark:text-slate-400" />
              </label>

              <label>
                <span className="sr-only">Sort products</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }} 
                  className="w-full rounded-xl border border-[#CBD5E1] dark:border-slate-700/80 bg-white dark:bg-[#0B1320] px-3 py-2.5 text-sm font-medium text-[#10233F] dark:text-slate-100 outline-none transition focus:border-[#1769E0] focus:ring-4 focus:ring-[#1769E0]/10 sm:py-3 cursor-pointer"
                >
                  <option value="createdAt" className="dark:bg-[#0B1320]">Newest first</option>
                  <option value="name" className="dark:bg-[#0B1320]">Name: A–Z</option>
                  <option value="model" className="dark:bg-[#0B1320]">Model number</option>
                </select>
              </label>
            </div>
          </div>

          {/* Department Quick Filter Badges */}
          <div className="mt-3 flex flex-nowrap items-center gap-1.5 overflow-x-auto border-t border-[#E2E8F0] dark:border-slate-800 pt-3 pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pt-4">
            <span className="mr-1 shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400 sm:text-[11px]">
              Explore by department
            </span>
            <button 
              type="button" 
              onClick={() => { setSelectedCategory('all'); setPage(1); }} 
              className={`shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
                selectedCategory === 'all' 
                  ? 'bg-[#1769E0] text-white shadow-xs' 
                  : 'border border-[#E2E8F0] dark:border-slate-700/80 bg-white dark:bg-[#16233B] text-[#64748B] dark:text-slate-300 hover:border-[#BFDCFA] dark:hover:border-slate-600 hover:text-[#1769E0] dark:hover:text-[#38BDF8]'
              }`}
            >
              All equipment
            </button>
            {categories.map((category) => (
              <button 
                key={category.name} 
                type="button" 
                onClick={() => { setSelectedCategory(category.name); setPage(1); }} 
                className={`shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
                  selectedCategory === category.name 
                    ? 'bg-[#1769E0] text-white shadow-xs' 
                    : 'border border-[#E2E8F0] dark:border-slate-700/80 bg-white dark:bg-[#16233B] text-[#64748B] dark:text-slate-300 hover:border-[#BFDCFA] dark:hover:border-slate-600 hover:text-[#1769E0] dark:hover:text-[#38BDF8]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Section Heading & Counter */}
        <div className="mb-5 mt-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0F2A43] dark:text-white">
              Available equipment
            </h2>
            <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
              {loading ? 'Updating the catalog…' : `${products.length} ${products.length === 1 ? 'product' : 'products'} shown`}
            </p>
          </div>
          {hasActiveFilters && (
            <button 
              type="button" 
              onClick={clearFilters} 
              className="text-xs font-semibold text-[#1769E0] dark:text-[#38BDF8] hover:text-[#1258BF] dark:hover:text-blue-400"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Product Cards Grid / State */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div 
                key={item} 
                className="h-[390px] animate-pulse rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#111C2E]"
              >
                <div className="h-48 rounded-t-2xl bg-[#F1F5F9] dark:bg-slate-800/50" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 rounded bg-[#E2E8F0] dark:bg-slate-700/50" />
                  <div className="h-5 w-3/4 rounded bg-[#E2E8F0] dark:bg-slate-700/50" />
                  <div className="h-3 w-full rounded bg-[#E2E8F0] dark:bg-slate-700/50" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-[#111C2E] px-6 py-16 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-[#1769E0] dark:text-[#38BDF8]" />
            <h3 className="mt-4 text-lg font-bold text-[#0F2A43] dark:text-white">
              No matching equipment found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B] dark:text-slate-400">
              Try a broader search or reset the filters to explore the complete catalog.
            </p>
            <button 
              type="button" 
              onClick={clearFilters} 
              className="mt-5 rounded-xl bg-[#1769E0] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1258BF] shadow-xs"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article 
                key={product._id} 
                className="group flex overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-[#111C2E] shadow-xs transition duration-300 hover:-translate-y-1 hover:border-[#BFDCFA] dark:hover:border-blue-500/40 hover:shadow-card" 
                data-aos="fade-up"
              >
                <Link 
                  href={`/products/${product.slug}`} 
                  className="flex min-h-[390px] w-full flex-col focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1769E0]/20"
                >
                  {/* Product Image Area */}
                  <div className="relative flex h-48 items-center justify-center overflow-hidden border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0B1320] p-5">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/[0.04] dark:to-blue-600/[0.05] pointer-events-none" />
                    <img 
                      src={product.images[0]?.url || '/images/hero_banner.jpg'} 
                      alt={product.name} 
                      className="h-full w-full object-contain transition duration-500 group-hover:scale-105 relative z-10" 
                    />
                    <span className="absolute left-3 top-3 max-w-[72%] truncate rounded-full bg-white/95 dark:bg-[#16233B]/95 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1769E0] dark:text-[#38BDF8] shadow-xs z-10">
                      {product.category}
                    </span>
                  </div>

                  {/* Product Details Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      <span className="font-semibold text-[#64748B] dark:text-slate-400">
                        {product.brand || 'Medical equipment'}
                      </span>
                      {product.model && (
                        <span className="max-w-[45%] truncate font-mono text-[#94A3B8] dark:text-slate-300 bg-slate-100 dark:bg-[#16233B] px-1.5 py-0.5 rounded">
                          {product.model}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-base font-bold leading-6 text-[#0F2A43] dark:text-slate-100 transition group-hover:text-[#1769E0] dark:group-hover:text-[#38BDF8]">
                      {product.name}
                    </h3>
                    
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#64748B] dark:text-slate-400 font-normal">
                      {product.shortDescription}
                    </p>

                    {/* Specification Badges */}
                    {product.specifications?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {product.specifications.slice(0, 2).map((spec, index) => (
                          <span 
                            key={`${spec.parameter}-${index}`} 
                            className="max-w-full truncate rounded-md bg-[#F0F6FE] dark:bg-[#0B1320] border border-[#E0EDFD] dark:border-slate-800 px-2 py-1 text-[10px] font-medium text-[#32577D] dark:text-slate-300"
                          >
                            <strong className="font-bold text-[#0F2A43] dark:text-slate-200">{spec.parameter}:</strong> {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="mt-auto flex items-center justify-between border-t border-[#E2E8F0] dark:border-slate-800 pt-4">
                      <span className="text-xs font-bold text-[#1769E0] dark:text-[#38BDF8]">
                        View details
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#1769E0] dark:text-[#38BDF8] transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Loading more indicator & intersection observer target */}
        {page < totalPages && (
          <div ref={observerTarget} className="mt-10 flex items-center justify-center p-4">
            {loadingMore && (
              <div className="flex items-center gap-2 text-sm font-semibold text-[#64748B] dark:text-slate-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#1769E0] border-t-transparent" />
                Loading more equipment...
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
