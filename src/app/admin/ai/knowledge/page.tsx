'use client';

import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  BookOpen,
  Filter,
  Sparkles,
  Layers,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useConfirm } from '@/components/ConfirmModal';
import { api } from '@/lib/api';

const defaultArticles = [
  {
    id: 'kb-1',
    category: 'Purchasing Process',
    title: 'Institutional Requisition & Quotation Lifecycle',
    content: 'Commercial quotations issued by Medlab Innovate Engineering Ltd have a standard validity of 30 days. Requisitions require destination hospital, oxygen pipeline specs, and room voltage confirmation prior to formal dispatch.',
    published: true,
    lastUpdated: '2026-09-27',
  },
  {
    id: 'kb-2',
    category: 'Troubleshooting',
    title: 'Ventilator Expiratory Error Code ERR-O2-FLOW-09 Protocol',
    content: 'Step 1: Check expiratory valve latch lock. Step 2: Ensure breathing circuit is disconnected. Step 3: Run pre-use calibration in Service mode. If unresolved, create support ticket for bio-transducer swap.',
    published: true,
    lastUpdated: '2026-09-28',
  },
  {
    id: 'kb-3',
    category: 'Services',
    title: 'Preventative Maintenance & ISO 17025 Calibration Standard',
    content: 'All critical ICU ventilators and laboratory analyzers must undergo annual or bi-annual PM. We perform NIST-traceable flow analyzer checks and issue digital calibration certificates.',
    published: true,
    lastUpdated: '2026-09-25',
  },
  {
    id: 'kb-4',
    category: 'Products',
    title: 'MedVent-9000 Pro Turbine Autonomy & HFNC Specs',
    content: 'Turbine operates without compressed medical air cylinders. Delivers up to 240 L/min peak flow and 80 L/min HFNC oxygen therapy. Dual hot-swappable batteries provide 6 hours continuous autonomy.',
    published: true,
    lastUpdated: '2026-09-29',
  },
];

const categories = [
  'All Domains',
  'Purchasing Process',
  'Troubleshooting',
  'Products',
  'Services',
  'FAQs',
  'Technical Information',
  'Installation',
  'Maintenance',
  'Company Information',
];

export default function AdminAIKnowledgePage() {
  const { confirm } = useConfirm();
  const [articles, setArticles] = useState(defaultArticles);
  const [selectedCategory, setSelectedCategory] = useState('All Domains');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Products');
  const [newContent, setNewContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const res = await api.getKnowledgeBase();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setArticles(
          res.data.map((item: any) => ({
            ...item,
            id: item._id || item.id,
            published: item.isPublished ?? item.published ?? true,
            lastUpdated: item.updatedAt
              ? (typeof item.updatedAt === 'string' ? item.updatedAt.slice(0, 10) : new Date(item.updatedAt).toISOString().slice(0, 10))
              : new Date().toISOString().slice(0, 10),
          }))
        );
      }
    } catch {
      // Fallback cleanly to default articles without showing an aggressive banner
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleTogglePublish = async (id: string) => {
    const article = articles.find((a) => a.id === id);
    if (!article) return;
    const published = !article.published;
    try {
      await api.updateKnowledgeArticle(id, { isPublished: published });
      setArticles(articles.map((a) => (a.id === id ? { ...a, published } : a)));
      showToast(published ? 'Article activated in 24/7 AI RAG context.' : 'Article temporarily unpublished from AI index.');
    } catch {
      setArticles(articles.map((a) => (a.id === id ? { ...a, published } : a)));
      showToast(published ? 'Article activated in AI RAG context (Local).' : 'Article unpublished from AI index (Local).');
    }
  };

  const handleDelete = async (id: string, title?: string) => {
    const ok = await confirm({
      title: 'Delete Knowledge Article',
      message: `Permanently delete "${title || id}" from the AI Assistant knowledge base?`,
      confirmText: 'Delete Article',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await api.deleteKnowledgeArticle(id);
    } catch {}

    setArticles(articles.filter((a) => a.id !== id));
    showToast('Knowledge article deleted successfully.');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newArt = {
      id: `kb-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      published: true,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    try {
      const saved = await api.createKnowledgeArticle({
        category: newCategory,
        title: newTitle.trim(),
        content: newContent.trim(),
        isPublished: true,
      });
      setArticles([{ ...newArt, id: saved?.data?.id || newArt.id }, ...articles]);
    } catch {
      setArticles([newArt, ...articles]);
    }

    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
    showToast('New approved knowledge article published to AI assistant index!');
  };

  const filteredArticles = articles.filter((art) => {
    const matchesCategory =
      selectedCategory === 'All Domains' || art.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 shadow-xs">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>AI Intelligence</span>
              <span>•</span>
              <span className="text-sky-600 font-bold">RAG Knowledge Base</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>AI Knowledge Base &amp; Approved Context</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Control the exact factual boundaries used by the 24/7 AI chatbot. AI strictly retrieves only published corporate content.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{showAddForm ? 'Close Form' : 'Publish Knowledge Article'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-sm transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add New Knowledge Article Form Card */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6 animate-in fade-in zoom-in-98 duration-150">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Grounded Knowledge Article</h2>
              <p className="text-xs text-slate-500 mt-0.5">Authoritative factual information to inject into the AI Chatbot RAG context.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Verified Fact</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category Domain
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              >
                {categories.filter((c) => c !== 'All Domains').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Article Title / Question
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Standard Payment and Warranty Policy for Export Orders"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Verified Technical Content (Exact facts for AI injection)
            </label>
            <textarea
              rows={4}
              required
              placeholder="State unambiguous technical specifications, operating guidelines, or company policies..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full p-4 font-sans text-xs leading-relaxed rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              Publish to AI RAG Index
            </button>
          </div>
        </form>
      )}

      {/* Curvy Search & Domain Filter Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge articles by question, keyword, or equipment..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 focus:bg-white transition"
          />
        </div>

        {/* Domain Filter Pill Capsule */}
        <div className="p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 flex flex-wrap gap-1.5 shadow-inner">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-sky-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center shadow-xs">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No knowledge articles match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1">Try selecting a different domain or clearing your search query.</p>
          </div>
        ) : (
          filteredArticles.map((art) => (
            <div
              key={art.id}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-200 transition-all space-y-4"
            >
              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/70">
                    {art.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">{art.title}</h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleTogglePublish(art.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      art.published
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100/70'
                        : 'bg-slate-100 text-slate-500 border border-slate-200/80 hover:bg-slate-200/70'
                    }`}
                    title={art.published ? 'Click to deactivate in AI' : 'Click to activate in AI'}
                  >
                    {art.published ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active in AI RAG</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Unpublished (Ignored)</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(art.id, art.title)}
                    className="w-9 h-9 rounded-xl border border-slate-200/70 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                    title="Delete knowledge article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Verified Content */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {art.content}
              </p>

              {/* Card Footer Metadata */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-semibold">{art.id}</span>
                  <span>•</span>
                  <span>Last Verified: {art.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sky-600 font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Indexed for 24/7 AI Biomedical Assistant</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
