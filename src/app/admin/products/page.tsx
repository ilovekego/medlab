'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit3,
  Copy,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';
import { api, fallbackProducts } from '@/lib/api';
import { IProduct } from '@/lib/types';
import { useConfirm } from '@/components/ConfirmModal';

function ProductsPageSkeleton() {
  return (
    <div className="space-y-5 pb-12 animate-pulse" aria-label="Loading products" role="status">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-72 rounded-lg bg-slate-200" />
          <div className="h-4 w-[34rem] max-w-full rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-slate-200" />
          <div className="h-10 w-44 rounded-xl bg-slate-200" />
        </div>
      </div>

      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0A1C2E] border border-slate-200 dark:border-[#163A5C] shadow-2xs">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="h-10 flex-1 rounded-xl bg-slate-100" />
          <div className="h-10 w-48 rounded-xl bg-slate-100" />
          <div className="h-10 w-36 rounded-xl bg-slate-100" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0A1C2E] rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-2xs overflow-hidden">
        <div className="h-12 bg-slate-100 border-b border-slate-200 dark:border-[#163A5C]" />
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 px-4 py-4 min-w-[900px]">
              <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
              <div className="w-64 space-y-2">
                <div className="h-3.5 w-52 rounded bg-slate-200" />
                <div className="h-3 w-36 rounded bg-slate-100" />
              </div>
              <div className="w-52 space-y-2">
                <div className="h-3.5 w-40 rounded bg-slate-200" />
                <div className="h-3 w-28 rounded bg-slate-100" />
              </div>
              <div className="w-40 space-y-2">
                <div className="h-6 w-28 rounded-md bg-slate-100" />
                <div className="h-3 w-24 rounded bg-slate-100" />
              </div>
              <div className="w-20 h-7 rounded-lg bg-slate-100" />
              <div className="w-24 h-7 rounded-full bg-slate-100" />
              <div className="ml-auto w-32 h-8 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading product catalog...</span>
    </div>
  );
}

export default function AdminProductsPage() {
  const { confirm } = useConfirm();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const firstPage = await api.getProducts('?allStatus=true&page=1');
      if (firstPage.success && Array.isArray(firstPage.data)) {
        const totalPages = Math.max(1, Number(firstPage.pagination?.totalPages) || 1);
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            api.getProducts(`?allStatus=true&page=${index + 2}`)
          )
        );
        const allProducts = [
          ...firstPage.data,
          ...remainingPages.flatMap((page) => (page.success && Array.isArray(page.data) ? page.data : [])),
        ];
        setProducts(allProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const res = await api.duplicateProduct(id);
      if (res.success) {
        setActionMessage('Product duplicated successfully as Draft.');
        loadProducts();
      }
    } catch {
      // Optimistic update
      const toDup = products.find((p) => p._id === id);
      if (toDup) {
        const copy: IProduct = {
          ...toDup,
          _id: `prod-${Date.now()}`,
          name: `${toDup.name} (Copy)`,
          slug: `${toDup.slug}-copy-${Date.now().toString().slice(-4)}`,
          sku: `${toDup.sku}-CP`,
          status: 'Draft',
        };
        setProducts([copy, ...products]);
        setActionMessage('Product duplicated as Draft (Local Mode).');
      }
    }
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleToggleStatus = async (p: IProduct) => {
    const newStatus = p.status === 'Published' ? 'Draft' : 'Published';
    try {
      await api.updateProduct(p._id, { status: newStatus });
      setProducts(products.map((item) => (item._id === p._id ? { ...item, status: newStatus } : item)));
      setActionMessage(`Product status updated to ${newStatus}.`);
    } catch {
      setProducts(products.map((item) => (item._id === p._id ? { ...item, status: newStatus } : item)));
      setActionMessage(`Product status updated to ${newStatus} (Local Mode).`);
    }
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Delete Equipment System',
      message: `Permanently delete "${name}"? This will remove all associated engineering specs and media references.`,
      confirmText: 'Delete System',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      setActionMessage(`Equipment "${name}" deleted successfully.`);
    } catch {
      setProducts(products.filter((p) => p._id !== id));
      setActionMessage(`Equipment "${name}" deleted (Local Mode).`);
    }
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      (p.model && p.model.toLowerCase().includes(search.toLowerCase()));

    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchStat = statusFilter === 'All' || p.status === statusFilter;

    return matchSearch && matchCat && matchStat;
  });

  const categories = [
    'All',
    'Hospital Medical Equipment',
    'Laboratory Equipment',
    'Analytical Instruments',
    'Molecular Biology & Life Science Equipment',
    'General Research & Scientific Equipment',
    'Consumables & Accessories',
    'Engineering Solutions'
  ];

  const hasActiveFilters = search.trim() !== '' || categoryFilter !== 'All' || statusFilter !== 'All';

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('All');
    setStatusFilter('All');
  };

  if (loading) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <span>Equipment Catalog Master</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed ml-13">
            Configure dynamic technical specifications, digital manuals, compliance documentation, and multi-channel equipment availability.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="w-11 h-11 rounded-2xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs disabled:opacity-50"
            title="Refresh Catalog Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm shadow-sky-600/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Equipment</span>
          </Link>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="p-1 text-sky-600 hover:text-sky-900 transition font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filters Bar in Curvy Rounded-3xl Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search equipment by name, SKU, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-900 placeholder-slate-400 font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Select */}
            <label className="relative min-w-[200px]">
              <span className="sr-only">Category</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-semibold bg-slate-50/70 hover:bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </div>
            </label>

            {/* Status Select */}
            <label className="relative min-w-[150px]">
              <span className="sr-only">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-2xl border border-slate-200/80 text-xs sm:text-sm font-semibold bg-slate-50/70 hover:bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-sky-500" />
              </div>
            </label>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-3 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-2xl transition flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Products Data Table in Curvy Rounded-3xl Shell */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-bold text-[11px] leading-tight border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-4.5 w-24 align-middle">Device</th>
                <th className="px-6 py-4.5 min-w-[280px] align-middle">System Name &amp; Model</th>
                <th className="px-6 py-4.5 min-w-[220px] align-middle">Category &amp; Division</th>
                <th className="px-6 py-4.5 min-w-[170px] align-middle">SKU / Brand</th>
                <th className="px-6 py-4.5 text-center align-middle">Specs</th>
                <th className="px-6 py-4.5 text-center align-middle">Status</th>
                <th className="px-6 py-4.5 text-right align-middle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Boxes className="w-7 h-7" />
                      </div>
                      <div className="text-base font-bold text-slate-900">No matching medical equipment found</div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Try modifying your search query or selecting a different category or status filter.
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Clear Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const primaryImg =
                    p.images?.find((img) => img.isPrimary)?.url ||
                    p.images?.[0]?.url ||
                    '/images/hero_banner.jpg';

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* 1. Device Image */}
                      <td className="px-6 py-4.5 align-middle">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden relative border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center p-1">
                          <Image
                            src={primaryImg}
                            alt={p.name}
                            fill
                            className="object-contain p-1.5"
                            sizes="56px"
                          />
                        </div>
                      </td>

                      {/* 2. System Name & Model */}
                      <td className="px-6 py-4.5 align-middle">
                        <div className="space-y-1">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="font-bold text-slate-900 hover:text-sky-600 transition inline-flex items-center gap-1.5 text-sm group/link leading-snug"
                          >
                            <span className="line-clamp-2 max-w-sm">{p.name}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-sky-600 transition shrink-0" />
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">Model:</span>
                            <span className="text-slate-500">{p.model || 'Standard OEM'}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Category & Division */}
                      <td className="px-6 py-4.5 align-middle">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800 text-xs sm:text-sm">{p.category}</div>
                          <div className="text-xs text-slate-500 font-medium">
                            {p.subcategory || 'General Equipment'}
                          </div>
                        </div>
                      </td>

                      {/* 4. SKU & Brand */}
                      <td className="px-6 py-4.5 align-middle">
                        <div className="space-y-1">
                          <code className="font-mono font-bold text-slate-800 text-xs px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80 inline-block tracking-tight">
                            {p.sku}
                          </code>
                          <div className="text-xs font-semibold text-sky-600">
                            {p.brand || 'Medlab Innovate OEM'}
                          </div>
                        </div>
                      </td>

                      {/* 5. Specs Count */}
                      <td className="px-6 py-4.5 align-middle text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 font-bold text-xs whitespace-nowrap">
                          {p.specifications?.length || 0} params
                        </span>
                      </td>

                      {/* 6. Status Toggle Button */}
                      <td className="px-6 py-4.5 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          title={`Status is ${p.status}. Click to change to ${p.status === 'Published' ? 'Draft' : 'Published'}`}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition shadow-2xs cursor-pointer ${
                            p.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {p.status === 'Published' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span>{p.status}</span>
                        </button>
                      </td>

                      {/* 7. Action Icons */}
                      <td className="px-6 py-4.5 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="w-9 h-9 rounded-xl border border-slate-200/70 bg-white hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 flex items-center justify-center text-slate-500 transition shadow-2xs"
                            title="Public Live View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/new?edit=${p._id || p.id || p.slug}`}
                            className="w-9 h-9 rounded-xl border border-slate-200/70 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center text-slate-500 transition shadow-2xs"
                            title="Edit Equipment Specifications"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p._id)}
                            className="w-9 h-9 rounded-xl border border-slate-200/70 bg-white hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 flex items-center justify-center text-slate-500 transition shadow-2xs cursor-pointer"
                            title="Duplicate as Draft"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p._id, p.name)}
                            className="w-9 h-9 rounded-xl border border-slate-200/70 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center text-slate-500 transition shadow-2xs cursor-pointer"
                            title="Delete System"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200 font-bold">{filteredProducts.length}</strong> of{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-bold">{products.length}</strong> registered systems
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            ISO 13485:2016 Certified Medical Device Documentation
          </span>
        </div>
      </div>
    </div>
  );
}
