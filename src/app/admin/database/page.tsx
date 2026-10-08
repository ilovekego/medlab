'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  Search,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Boxes,
  FileSpreadsheet,
  FileCheck,
  Headphones,
  Users,
  Bot,
  BrainCircuit,
  FileEdit,
  SlidersHorizontal,
  Clock,
  Bell,
  FolderOpen,
  X
} from 'lucide-react';
import { api } from '@/lib/api';
import { useConfirm } from '@/components/ConfirmModal';

interface CollectionInfo {
  name: string;
  label: string;
  count: number;
  description: string;
  icon: string;
}

const ICON_MAP: Record<string, any> = {
  Boxes,
  Layers,
  FileSpreadsheet,
  FileCheck,
  Headphones,
  Users,
  Bot,
  BrainCircuit,
  FileEdit,
  SlidersHorizontal,
  Clock,
  Bell,
  FolderOpen,
  Database
};

export default function AdminDatabasePage() {
  const { confirm } = useConfirm();
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>('products');
  const [docs, setDocs] = useState<any[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isNewDoc, setIsNewDoc] = useState(false);
  const [newDocId, setNewDocId] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (selectedCol) {
      loadCollectionDocuments(selectedCol);
    }
  }, [selectedCol]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await api.getDatabaseOverview();
      if (res.success && Array.isArray(res.collections)) {
        setCollections(res.collections);
      }
    } catch {
      showToast('Error loading collections overview', 'error');
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadCollectionDocuments = async (colName: string) => {
    setLoadingDocs(true);
    try {
      const res = await api.getCollectionDocs(colName, 100);
      if (res.success && Array.isArray(res.data)) {
        setDocs(res.data);
      } else {
        setDocs([]);
      }
    } catch {
      setDocs([]);
      showToast(`Failed to load documents from ${colName}`, 'error');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleOpenEdit = (doc: any) => {
    setIsNewDoc(false);
    setEditingDoc(doc);
    const cleanDoc = { ...doc };
    delete cleanDoc._rawId;
    delete cleanDoc._id;
    delete cleanDoc.id;
    setJsonText(JSON.stringify(cleanDoc, null, 2));
    setJsonError(null);
  };

  const handleOpenNew = () => {
    setIsNewDoc(true);
    setNewDocId('');
    setEditingDoc({});
    setJsonText('{\n  \n}');
    setJsonError(null);
  };

  const handleSaveJson = async () => {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err: any) {
      setJsonError('Invalid JSON format: ' + err.message);
      return;
    }

    setSaving(true);
    setJsonError(null);

    const docId = isNewDoc ? newDocId.trim() : (editingDoc._rawId || editingDoc._id || editingDoc.id);

    try {
      const res = await api.saveCollectionDoc(selectedCol, docId, parsed);
      if (res.success) {
        showToast(isNewDoc ? `Document created (${res.docId})` : `Document updated (${docId})`);
        setEditingDoc(null);
        loadCollectionDocuments(selectedCol);
        loadOverview();
      } else {
        setJsonError('Failed to save document to Firestore.');
      }
    } catch (err: any) {
      setJsonError(err.message || 'Error writing to Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (docId: string) => {
    const ok = await confirm({
      title: `Delete Document from ${selectedCol}`,
      message: `Permanently delete document "${docId}"? This operation cannot be undone in Firestore.`,
      confirmText: 'Delete Document',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      const res = await api.deleteCollectionDoc(selectedCol, docId);
      if (res.success) {
        showToast(`Document "${docId}" deleted successfully`);
        setDocs(docs.filter((d) => (d._rawId || d._id || d.id) !== docId));
        loadOverview();
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting document', 'error');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCurrentCollection = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(docs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `medlab_firestore_${selectedCol}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${docs.length} documents from ${selectedCol}`);
  };

  const totalDocuments = collections.reduce((acc, c) => acc + c.count, 0);
  const activeColInfo = collections.find((c) => c.name === selectedCol);

  const filteredDocs = docs.filter((d) => {
    const id = (d._rawId || d._id || d.id || '').toLowerCase();
    const str = JSON.stringify(d).toLowerCase();
    const q = search.toLowerCase();
    return id.includes(q) || str.includes(q);
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <span>Firestore Live Collections &amp; Records</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed ml-13">
            Directly browse, query, inspect, edit, backup, and modify stored website documents across all live Firestore collections.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              loadOverview();
              loadCollectionDocuments(selectedCol);
            }}
            disabled={loadingOverview || loadingDocs}
            className="w-11 h-11 rounded-2xl border border-slate-200/80 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${(loadingOverview || loadingDocs) ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          <button
            onClick={exportCurrentCollection}
            disabled={docs.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Document</span>
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-2xs animate-fadeIn ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Database Connection & Stats Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Connection State</span>
            <span className="text-lg font-bold text-sky-600 flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected Live
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Firebase Project</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block truncate">
              medlabinnovate
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Code2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tracked Collections</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              {collections.length} Collections
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Stored Records</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              {totalDocuments.toLocaleString()} Documents
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Layout: Collection Tabs on Left, Active Document Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Collection Selector Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 bg-slate-50/75 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Firestore Collections</span>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">{collections.length} total</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {collections.map((col) => {
              const isSelected = selectedCol === col.name;
              const IconComponent = ICON_MAP[col.icon] || Database;

              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setSelectedCol(col.name)}
                  className={`w-full text-left p-4 transition flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/80 text-sky-900 font-bold'
                      : 'hover:bg-slate-50/70 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-xs shadow-sky-600/30'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                        {col.label}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        col: {col.name}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {col.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Explorer & Editor Table (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Bar with Search & Active Meta in Curvy Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-900 truncate">
                  {activeColInfo?.label || selectedCol}
                </h2>
                <p className="text-xs text-slate-500 truncate">
                  {activeColInfo?.description || `Live records from '${selectedCol}'`}
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search doc ID or values..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-900 placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Documents Table in Curvy Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/75 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Documents ({filteredDocs.length})</span>
              <span className="text-[11px] text-slate-400 font-mono">Limit: 100 per view</span>
            </div>

            {loadingDocs ? (
              <div className="p-16 text-center text-slate-400 text-xs font-semibold">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-600" />
                Loading documents from Firestore...
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-16 text-center text-slate-400 text-xs">
                <Database className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No documents found</p>
                <p className="text-slate-400 text-xs mt-1">
                  {search ? 'Try adjusting your search criteria.' : `Collection '${selectedCol}' has no documents yet.`}
                </p>
                <button
                  onClick={handleOpenNew}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-600 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Document</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
                {filteredDocs.map((docItem) => {
                  const docId = docItem._rawId || docItem._id || docItem.id || 'unknown-id';
                  const titleOrName = docItem.name || docItem.title || docItem.customerName || docItem.headline || docItem.email || docItem.quoteNumber || docItem.enquiryId || '(Document Record)';
                  const dateStr = docItem.updatedAt || docItem.createdAt || null;

                  return (
                    <div
                      key={docId}
                      className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 truncate max-w-xs">
                            {docId}
                          </span>
                          <button
                            onClick={() => handleCopy(docId, docId)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                            title="Copy Document ID"
                          >
                            {copiedId === docId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {dateStr && (
                            <span className="text-[11px] text-slate-400">
                              {typeof dateStr === 'string' ? new Date(dateStr).toLocaleDateString() : ''}
                            </span>
                          )}
                        </div>

                        <p className="font-bold text-slate-900 text-sm truncate">
                          {titleOrName}
                        </p>

                        {/* Snapshot of fields */}
                        <div className="text-xs text-slate-500 truncate mt-1">
                          {Object.keys(docItem)
                            .filter((k) => !['_rawId', '_id', 'id', 'name', 'title'].includes(k))
                            .slice(0, 3)
                            .map((k) => `${k}: ${typeof docItem[k] === 'object' ? '[Obj]' : String(docItem[k])}`)
                            .join(' • ')}
                        </div>
                      </div>

                      {/* Row Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setViewingDoc(docItem)}
                          className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white hover:bg-sky-50 text-slate-500 hover:text-sky-600 flex items-center justify-center transition cursor-pointer"
                          title="Inspect Document JSON"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(docItem)}
                          className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition cursor-pointer"
                          title="Edit Document Fields"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(docId)}
                          className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
                          title="Delete from Firestore"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: View Document JSON */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-sky-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-md">
                  Document Inspector: {viewingDoc._rawId || viewingDoc._id || viewingDoc.id}
                </span>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs bg-slate-950 text-emerald-400 rounded-b-none">
              <pre className="whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(viewingDoc, null, 2)}
              </pre>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/75">
              <button
                onClick={() => {
                  handleCopy(JSON.stringify(viewingDoc, null, 2), 'modal-copy');
                  showToast('Document JSON copied to clipboard');
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Full JSON</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    const toEdit = viewingDoc;
                    setViewingDoc(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2 rounded-2xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 shadow-sm shadow-sky-600/20 cursor-pointer"
                >
                  Edit Document
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 rounded-2xl border border-slate-200/80 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit or Create Document */}
      {editingDoc !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-4 h-4 text-sky-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-md">
                  {isNewDoc ? `New Document in '${selectedCol}'` : `Edit Document: ${editingDoc._rawId || editingDoc._id || editingDoc.id}`}
                </span>
              </div>
              <button
                onClick={() => setEditingDoc(null)}
                className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {isNewDoc && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Document ID <span className="text-slate-400 font-normal">(Leave blank to auto-generate)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. custom-id-123"
                    value={newDocId}
                    onChange={(e) => setNewDocId(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs font-mono rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Document Data (JSON)
                  </label>
                  <span className="text-[11px] text-slate-400">Strict JSON formatting required</span>
                </div>
                <textarea
                  rows={14}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full p-4 font-mono text-xs rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  placeholder='{\n  "name": "Value"\n}'
                />
              </div>

              {jsonError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{jsonError}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/75">
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="px-5 py-2.5 rounded-2xl border border-slate-200/80 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveJson}
                disabled={saving}
                className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm shadow-sky-600/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{saving ? 'Saving...' : 'Save to Firestore'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
