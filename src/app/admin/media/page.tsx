'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen,
  UploadCloud,
  Search,
  FileText,
  Image as ImageIcon,
  Copy,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { uploadImage, getImageHostingUsage, UsageResult } from '@/lib/imageUpload';
import { uploadToGoogleDrive } from '@/lib/gdriveUpload';
import { useConfirm } from '@/components/ConfirmModal';
import { api } from '@/lib/api';

interface MediaAsset {
  id: string;
  _id?: string;
  title: string;
  url: string;
  type: 'image' | 'pdf' | string;
  size: string;
  updatedAt: string;
}

export default function AdminMediaPage() {
  const { confirm } = useConfirm();
  const [files, setFiles] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<UsageResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await api.getMediaAssets();
      if (res.success && Array.isArray(res.data)) {
        setFiles(res.data);
      }
    } catch {
      setToast({ message: 'Error loading media assets.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCatalog = async () => {
    setSyncing(true);
    try {
      const res = await api.syncCatalogMedia();
      if (res.success) {
        setFiles(res.data);
        setToast({
          message: `Synchronized ${res.count} catalog assets! Total: ${res.data.length} equipment media items ready.`,
          type: 'success',
        });
      } else {
        setToast({ message: 'Catalog media synchronization failed.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: err?.message || 'Error syncing catalog media.', type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  // Load persisted files from Firestore and CDN usage
  useEffect(() => {
    loadMedia();

    async function fetchQuota() {
      const res = await getImageHostingUsage();
      if (res) setUsage(res);
    }
    fetchQuota();
  }, []);

  const saveFiles = (newFiles: MediaAsset[]) => {
    setFiles(newFiles);
    try {
      localStorage.setItem('medlab_media_library', JSON.stringify(newFiles));
    } catch (err) {
      console.error('Failed to persist media assets in localStorage:', err);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard?.writeText(url);
    setToast({ message: `Permanent CDN link copied: ${url}`, type: 'success' });
    setTimeout(() => setToast(null), 3500);
  };

  const handleDelete = async (id: string, title?: string) => {
    const ok = await confirm({
      title: 'Remove Media',
      message: `Remove "${title || id}" from media assets?`,
      confirmText: 'Remove',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await api.deleteMediaAsset(id);
    } catch {}

    const updated = files.filter((f) => f.id !== id && f._id !== id);
    saveFiles(updated);
    setToast({ message: 'Media asset record removed.', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    setUploading(true);
    setToast(null);

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        const res = await uploadToGoogleDrive(file);
        if (res.success && (res.downloadUrl || res.viewUrl)) {
          const finalUrl = res.downloadUrl || res.viewUrl!;
          const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
          const assetData = {
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: finalUrl,
            type: 'pdf',
            size: sizeMb,
          };
          let firestoreId = res.fileId || `gdrive-${Date.now()}`;
          try {
            const savedRes = await api.createMediaAsset(assetData);
            if (savedRes.success && savedRes.data) {
              firestoreId = savedRes.data.id || firestoreId;
            }
          } catch {}

          const newAsset: MediaAsset = {
            id: firestoreId,
            ...assetData,
            updatedAt: new Date().toISOString().split('T')[0],
          };

          const updated = [newAsset, ...files];
          saveFiles(updated);

          setToast({ message: `PDF uploaded to Google Drive with public access! URL copied to clipboard.`, type: 'success' });
          navigator.clipboard?.writeText(finalUrl);
        } else {
          setToast({ message: res.error || 'Failed to upload PDF to Google Drive.', type: 'error' });
        }
      } else {
        const res = await uploadImage(file);

        if (res.success && res.url) {
          const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
          const assetData = {
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: res.url,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            size: sizeMb,
          };
          let firestoreId = res.id || `cdn-${Date.now()}`;
          try {
            const savedRes = await api.createMediaAsset(assetData);
            if (savedRes.success && savedRes.data) {
              firestoreId = savedRes.data.id || firestoreId;
            }
          } catch {}

          const newAsset: MediaAsset = {
            id: firestoreId,
            ...assetData,
            updatedAt: new Date().toISOString().split('T')[0],
          };

          const updated = [newAsset, ...files];
          saveFiles(updated);

          // Update usage count if returned
          if (res.usage) {
            setUsage({ count: res.usage.current, plan: 'free' });
          }

          setToast({ message: `Uploaded successfully! Permanent CDN URL: ${res.url}`, type: 'success' });
          navigator.clipboard?.writeText(res.url);
        } else {
          setToast({ message: res.error || 'Upload failed. Check API key and file size.', type: 'error' });
        }
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Error uploading file.', type: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setToast(null), 4500);
    }
  };

  const filtered = files.filter((f) => {
    const matchSearch = f.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || f.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span>Media &amp; CDN Asset Storage</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed ml-13">
            Upload high-resolution equipment photography, engineering manuals, and technical brochures with permanent edge CDN distribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleSyncCatalog}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            title="Scan product catalog and sync equipment photos into media library"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Catalog Photos'}</span>
          </button>

          <button
            onClick={loadMedia}
            disabled={loading}
            className="w-9 h-9 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh media gallery"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>

          {/* CDN Usage Badge */}
          {usage && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 border border-sky-200/80 rounded-2xl text-xs font-bold text-sky-800">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>
                CDN: <strong>{usage.count}</strong> / 500
              </span>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-2xs animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,application/pdf"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {/* Curvy Upload Drag & Drop Area */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!uploading) handleFileUpload(e.dataTransfer.files);
        }}
        className={`bg-white border-2 border-dashed rounded-3xl p-10 sm:p-12 text-center transition cursor-pointer shadow-xs space-y-3 ${
          uploading
            ? 'border-sky-400 bg-sky-50/50 cursor-wait'
            : 'border-slate-300 hover:border-sky-500 hover:bg-sky-50/20'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-2xs">
          {uploading ? <Loader2 className="w-8 h-8 animate-spin text-sky-600" /> : <UploadCloud className="w-8 h-8" />}
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {uploading ? 'Processing & Dispatching to CDN...' : 'Drop Equipment Media & Manuals Here'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1 leading-relaxed">
            Click to browse local files or drop imagery or PDF technical sheets. Photos receive high-speed CDN URLs; PDFs are synced to Google Drive.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="inline-block text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/70">
            Images: JPG, PNG, WEBP, GIF
          </span>
          <span className="inline-block text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/70">
            PDFs & Technical Datasheets
          </span>
        </div>
      </div>

      {/* Filter and Search Bar in Curvy Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-slate-900 placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              typeFilter === 'all'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            All Media ({files.length})
          </button>
          <button
            onClick={() => setTypeFilter('image')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              typeFilter === 'image'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            Images Only
          </button>
          <button
            onClick={() => setTypeFilter('pdf')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              typeFilter === 'pdf'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            PDF Documents
          </button>
        </div>
      </div>

      {/* Files Grid in Curvy Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center text-slate-400 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No media assets found</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Upload images or documents using the dropzone above to generate instant CDN links.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-sky-50 text-sky-700 border border-sky-200/60">
                    {f.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-medium">{f.size}</span>
                </div>

                {/* Thumbnail if image or PDF preview */}
                {f.type === 'image' ? (
                  <div className="w-full h-44 bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt={f.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-44 bg-rose-50/40 rounded-2xl border border-rose-100 flex flex-col items-center justify-center p-4 text-center">
                    <FileText className="w-12 h-12 text-rose-500 mb-2" />
                    <span className="text-xs font-bold text-slate-800 truncate max-w-full">{f.title}.pdf</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">PDF Technical Specification</span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                    {f.type === 'pdf' ? (
                      <FileText className="w-4 h-4 text-rose-600" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-sky-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={f.title}>
                      {f.title}
                    </h3>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-600 hover:underline font-mono block mt-1 truncate flex items-center gap-1"
                    >
                      <span className="truncate">{f.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleCopyUrl(f.url)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CDN Link</span>
                </button>

                <button
                  onClick={() => handleDelete(f.id, f.title)}
                  className="w-8 h-8 rounded-xl border border-slate-200/70 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition shadow-2xs cursor-pointer"
                  title="Delete Asset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
