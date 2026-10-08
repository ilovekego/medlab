'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Tag,
  CheckCircle2,
  Award,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { api, fallbackCategories } from '@/lib/api';
import { ICategory, IBrand } from '@/lib/types';
import { useConfirm } from '@/components/ConfirmModal';

export default function AdminCategoriesPage() {
  const { confirm } = useConfirm();
  const [categories, setCategories] = useState<ICategory[]>(fallbackCategories);
  const [brands, setBrands] = useState<IBrand[]>([
    { name: 'Medlab Engineering OEM', slug: 'medlab-engineering-oem', description: 'In-house biomedical engineering and precision ventilators', website: 'https://medlabinnovate.co.ke' },
    { name: 'HemaCount Diagnostics', slug: 'hemacount-diagnostics', description: 'Laser flow cytometry & automated 5-part hematology systems' },
    { name: 'SonoEcho Technologies', slug: 'sonoecho-technologies', description: 'Cardiovascular and multi-specialty 4D/5D ultrasound systems' },
    { name: 'PureFlow BioSafety', slug: 'pureflow-biosafety', description: 'HEPA laminar airflow cabinets and cleanroom modules' },
  ]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatSubs, setNewCatSubs] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const cRes = await api.getCategories();
        if (cRes.success && cRes.data.length > 0) setCategories(cRes.data);
        const bRes = await api.getBrands();
        if (bRes.success && bRes.data.length > 0) setBrands(bRes.data);
      } catch (err) {
        console.error('Category load error:', err);
      }
    }
    load();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const subArr = newCatSubs.split(',').map((s) => s.trim()).filter(Boolean);
    const newCat: ICategory = {
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      subcategories: subArr,
      order: categories.length + 1,
    };

    try {
      await api.createCategory(newCat);
    } catch {
      // Local fallback
    }

    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatSubs('');
    setMsg(`Category "${newCatName}" created successfully!`);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;

    const brand: IBrand = {
      name: newBrandName,
      slug: newBrandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newBrandDesc || 'Authorized Medical Equipment Partner',
    };

    setBrands([...brands, brand]);
    setNewBrandName('');
    setNewBrandDesc('');
    setMsg(`Brand partner "${newBrandName}" added!`);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDeleteCategory = async (catName: string) => {
    const ok = await confirm({
      title: 'Delete Category',
      message: `Delete "${catName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;

    const catObj = categories.find((c) => c.name === catName);
    if (catObj?._id) {
      try {
        await api.deleteCategory(catObj._id);
      } catch (err) {
        console.error('Failed to delete category in backend:', err);
      }
    }
    setCategories((prev) => prev.filter((c) => c.name !== catName));
    setMsg(`Category "${catName}" deleted successfully.`);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDeleteBrand = async (bName: string) => {
    const ok = await confirm({
      title: 'Remove Brand',
      message: `Remove "${bName}" from OEM partners?`,
      confirmText: 'Remove',
      variant: 'danger',
    });
    if (!ok) return;

    setBrands((prev) => prev.filter((b) => b.name !== bName));
    setMsg(`Brand partner "${bName}" removed.`);
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <span>Categories, Subcategories &amp; OEM Brands</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed ml-13">
          Dynamically organize the equipment catalog taxonomy, medical specialties, and certified OEM manufacturer affiliations.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* 2-Column Split: Categories on left, Brands on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Categories Section (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Catalog Categories</h2>
                <p className="text-xs text-slate-500">Active medical equipment classifications ({categories.length})</p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold">
                {categories.length} Categories
              </span>
            </div>

            {/* Category Cards List */}
            <div className="space-y-3.5">
              {categories.map((c, idx) => (
                <div key={idx} className="p-4 sm:p-5 rounded-2xl border border-slate-200/70 hover:border-sky-300 hover:shadow-xs transition bg-slate-50/50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-sky-100/70 text-sky-700 text-xs font-extrabold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.name)}
                      className="w-8 h-8 rounded-xl border border-slate-200/60 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subcategories tags */}
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {c.subcategories && c.subcategories.length > 0 ? (
                      c.subcategories.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-xs font-medium text-slate-700 shadow-2xs"
                        >
                          <Tag className="w-3 h-3 text-sky-500" />
                          <span>{sub}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No subcategories defined</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Category Form */}
            <form onSubmit={handleAddCategory} className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Add New Category</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Diagnostic Radiography)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
                />
                <input
                  type="text"
                  placeholder="Subcategories (comma separated: CT, MRI, X-Ray)"
                  value={newCatSubs}
                  onChange={(e) => setNewCatSubs(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm shadow-sky-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Create Category</span>
              </button>
            </form>
          </div>
        </div>

        {/* Brands Section (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">OEM Partner Brands</h2>
                  <p className="text-xs text-slate-500">Authorized medical manufacturers ({brands.length})</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {brands.map((b, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{b.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{b.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBrand(b.name)}
                    className="w-8 h-8 rounded-xl border border-slate-200/60 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer"
                    title="Remove Brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Brand */}
            <form onSubmit={handleAddBrand} className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Register OEM Partner</h4>
              <input
                type="text"
                required
                placeholder="Brand / OEM Name (e.g. Philips BioMed)"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
              />
              <input
                type="text"
                placeholder="Brief Engineering Specialization"
                value={newBrandDesc}
                onChange={(e) => setNewBrandDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Register OEM Partner</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
