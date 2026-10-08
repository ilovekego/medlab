'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Boxes,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  Layers,
  Wrench,
  ShieldCheck,
  Globe,
  GraduationCap,
  Loader2,
  RefreshCw,
  Copy,
  Image as ImageIcon,
  X,
  ExternalLink
} from 'lucide-react';
import { api, fallbackProducts } from '@/lib/api';
import { uploadImage } from '@/lib/imageUpload';
import { uploadToGoogleDrive } from '@/lib/gdriveUpload';

const defaultCategories = [
  'Hospital Medical Equipment',
  'Laboratory Equipment',
  'Analytical Instruments',
  'Molecular Biology & Life Science Equipment',
  'General Research & Scientific Equipment',
  'Consumables & Accessories',
  'Engineering Solutions',
];

function ProductFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [targetDocId, setTargetDocId] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [categoriesList, setCategoriesList] = useState<string[]>(defaultCategories);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Hospital Medical Equipment');
  const [subcategory, setSubcategory] = useState('ICU Ventilators');
  const [brand, setBrand] = useState('Medlab Engineering OEM');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  // Fetch categories from API to include any custom categories created
  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = res.data.map((c) => c.name);
          setCategoriesList(Array.from(new Set([...defaultCategories, ...names])));
        }
      })
      .catch(() => {});
  }, []);
  
  // Dynamic Specifications: Parameter | Value | Unit
  const [specifications, setSpecifications] = useState<Array<{ parameter: string; value: string; unit?: string }>>([]);

  // Dynamic Features & Applications lists
  const [features, setFeatures] = useState<string[]>([]);
  const [applications, setApplications] = useState<string[]>([]);

  // Media & Documents
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [brochureUrl, setBrochureUrl] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingManual, setUploadingManual] = useState(false);
  const [brochureUploadError, setBrochureUploadError] = useState<string | null>(null);
  const [manualUploadError, setManualUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const brochureFileRef = useRef<HTMLInputElement>(null);
  const manualFileRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const skuInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [floatingToast, setFloatingToast] = useState<{
    type: 'error' | 'success';
    message: string;
    actionField?: 'name' | 'sku';
  } | null>(null);

  // Focus and smoothly scroll to invalid field
  const focusAndScrollField = (field: 'name' | 'sku') => {
    if (field === 'name') {
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInputRef.current?.focus();
    } else if (field === 'sku') {
      skuInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      skuInputRef.current?.focus();
    }
  };

  // Requirements & Warranty
  const [warranty, setWarranty] = useState('');
  const [installationRequirements, setInstallationRequirements] = useState('');
  const [trainingRequirements, setTrainingRequirements] = useState('');
  const [priceEstimate, setPriceEstimate] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Auto-generate slug and SEO from name if not manually edited
  const handleNameChange = (val: string) => {
    setName(val);
    if (fieldErrors.name) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.name;
        return copy;
      });
    }
    if (errorMsg && !fieldErrors.sku) setErrorMsg(null);
    if (floatingToast?.actionField === 'name') setFloatingToast(null);

    if (!editId) {
      const genSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(genSlug);
      if (!seoTitle) setSeoTitle(`${val} | Medlab Innovate Engineering`);
    }
  };

  const handleSkuChange = (val: string) => {
    setSku(val);
    if (fieldErrors.sku) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.sku;
        return copy;
      });
    }
    if (errorMsg && !fieldErrors.name) setErrorMsg(null);
    if (floatingToast?.actionField === 'sku') setFloatingToast(null);
  };

  // If in edit mode, fetch and populate existing product data cleanly
  useEffect(() => {
    if (!editId) {
      setLoadingProduct(false);
      return;
    }

    let isMounted = true;
    setLoadingProduct(true);
    setErrorMsg(null);

    api.getProductById(editId)
      .then((res) => {
        if (!isMounted) return;
        const existing = res.data;
        if (!existing) {
          setErrorMsg('Product details not found.');
          return;
        }

        setTargetDocId(existing._id || existing.id || editId);
        setName(existing.name || '');
        setSlug(existing.slug || '');
        setSku(existing.sku || '');
        setModel(existing.model || '');
        if (existing.category) setCategory(existing.category);
        if (existing.subcategory) setSubcategory(existing.subcategory);
        if (existing.brand) setBrand(existing.brand);
        setShortDescription(existing.shortDescription || '');
        setDescription(existing.description || '');

        if (existing.specifications && Array.isArray(existing.specifications) && existing.specifications.length > 0) {
          setSpecifications(
            existing.specifications.map((s: any) => ({
              parameter: s.parameter || '',
              value: s.value || '',
              unit: s.unit || '',
            }))
          );
        } else {
          setSpecifications([]);
        }

        if (existing.features && Array.isArray(existing.features)) {
          setFeatures(existing.features.filter(Boolean));
        } else {
          setFeatures([]);
        }

        if (existing.applications && Array.isArray(existing.applications)) {
          setApplications(existing.applications.filter(Boolean));
        } else {
          setApplications([]);
        }

        setWarranty(existing.warranty || '');
        setInstallationRequirements(existing.installationRequirements || '');
        setTrainingRequirements(existing.trainingRequirements || '');
        setPriceEstimate(existing.priceEstimate || '');

        const primaryImg =
          existing.images?.find((img: any) => img.isPrimary)?.url ||
          existing.images?.[0]?.url ||
          (existing as any).image ||
          '';
        if (primaryImg) setMainImageUrl(primaryImg);

        const brochure = existing.documents?.find(
          (d: any) => d.type === 'Brochure' || d.title?.toLowerCase().includes('brochure')
        );
        const manual = existing.documents?.find(
          (d: any) => d.type === 'Manual' || d.title?.toLowerCase().includes('manual')
        );
        if (brochure?.url) setBrochureUrl(brochure.url);
        if (manual?.url) setManualUrl(manual.url);

        const seo = (existing as any).seo;
        setSeoTitle(seo?.title || (existing as any).seoTitle || existing.name || '');
        setSeoDescription(seo?.description || (existing as any).seoDescription || existing.shortDescription || '');
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Failed to load product for editing:', err);
        setErrorMsg('Failed to load product specifications: ' + (err.message || 'Unknown error'));
      })
      .finally(() => {
        if (isMounted) setLoadingProduct(false);
      });

    return () => {
      isMounted = false;
    };
  }, [editId]);


  // Dynamic Specs Add/Remove
  const addSpecRow = () => {
    setSpecifications([...specifications, { parameter: '', value: '', unit: '' }]);
  };
  const updateSpecRow = (idx: number, field: 'parameter' | 'value' | 'unit', val: string) => {
    const updated = [...specifications];
    updated[idx][field] = val;
    setSpecifications(updated);
  };
  const removeSpecRow = (idx: number) => {
    setSpecifications(specifications.filter((_, i) => i !== idx));
  };

  // Features Add/Remove
  const addFeature = () => setFeatures([...features, '']);
  const updateFeature = (idx: number, val: string) => {
    const copy = [...features];
    copy[idx] = val;
    setFeatures(copy);
  };
  const removeFeature = (idx: number) => setFeatures(features.filter((_, i) => i !== idx));

  // Applications Add/Remove
  const addApp = () => setApplications([...applications, '']);
  const updateApp = (idx: number, val: string) => {
    const copy = [...applications];
    copy[idx] = val;
    setApplications(copy);
  };
  const removeApp = (idx: number) => setApplications(applications.filter((_, i) => i !== idx));

  const processImageFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File size exceeds the 20MB limit. Please choose a smaller image.');
      return;
    }

    setUploadingImage(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await uploadImage(file);
      if (res.success && res.url) {
        setMainImageUrl(res.url);
        setUploadSuccess('Product image uploaded successfully!');
        setTimeout(() => setUploadSuccess(null), 4000);
      } else {
        setUploadError(res.error || 'Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 50 * 1024 * 1024) {
      setBrochureUploadError('File size exceeds the 50MB limit.');
      return;
    }

    setUploadingBrochure(true);
    setBrochureUploadError(null);

    try {
      const res = await uploadToGoogleDrive(file);
      if (res.success && (res.downloadUrl || res.viewUrl)) {
        setBrochureUrl(res.downloadUrl || res.viewUrl!);
        setUploadSuccess(`Brochure "${file.name}" uploaded to Google Drive with public access!`);
        setTimeout(() => setUploadSuccess(null), 4000);
      } else {
        setBrochureUploadError(res.error || 'Failed to upload brochure to Google Drive.');
      }
    } catch (err: any) {
      setBrochureUploadError(err.message || 'Error uploading brochure to Google Drive.');
    } finally {
      setUploadingBrochure(false);
      if (brochureFileRef.current) {
        brochureFileRef.current.value = '';
      }
    }
  };

  const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 50 * 1024 * 1024) {
      setManualUploadError('File size exceeds the 50MB limit.');
      return;
    }

    setUploadingManual(true);
    setManualUploadError(null);

    try {
      const res = await uploadToGoogleDrive(file);
      if (res.success && (res.downloadUrl || res.viewUrl)) {
        setManualUrl(res.downloadUrl || res.viewUrl!);
        setUploadSuccess(`Service Manual "${file.name}" uploaded to Google Drive with public access!`);
        setTimeout(() => setUploadSuccess(null), 4000);
      } else {
        setManualUploadError(res.error || 'Failed to upload service manual to Google Drive.');
      }
    } catch (err: any) {
      setManualUploadError(err.message || 'Error uploading service manual to Google Drive.');
    } finally {
      setUploadingManual(false);
      if (manualFileRef.current) {
        manualFileRef.current.value = '';
      }
    }
  };

  // Submission
  const handleSubmit = async (publishStatus: 'Published' | 'Draft') => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) {
      errors.name = 'Equipment / Device Name is required.';
    }
    if (!sku.trim()) {
      errors.sku = 'SKU / Catalog Number is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstField = !name.trim() ? 'name' : 'sku';
      const msg = !name.trim() && !sku.trim()
        ? 'Please enter Equipment Name and SKU before saving.'
        : errors[firstField];

      setErrorMsg(msg);
      setFloatingToast({
        type: 'error',
        message: msg,
        actionField: firstField,
      });

      // Smooth auto-scroll directly to the first missing field
      focusAndScrollField(firstField);
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setFieldErrors({});
    setFloatingToast(null);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku,
      model: model || name,
      category,
      subcategory,
      brand,
      shortDescription,
      description,
      specifications: specifications.filter((s) => s.parameter.trim() !== ''),
      features: features.filter((f) => f.trim() !== ''),
      applications: applications.filter((a) => a.trim() !== ''),
      images: [{ url: mainImageUrl || '/images/default-equipment.png', isPrimary: true, alt: name }],
      documents: [
        ...(brochureUrl ? [{ title: `${name} Brochure`, type: 'Brochure', url: brochureUrl, size: '2.1 MB' }] : []),
        ...(manualUrl ? [{ title: `${name} Service Manual`, type: 'Manual', url: manualUrl, size: '4.8 MB' }] : []),
      ],
      warranty: warranty || '24 Months Complete Biomedical Warranty',
      installationRequirements: installationRequirements || 'Standard hospital electrical power, level surface, grounding.',
      trainingRequirements: trainingRequirements || 'Clinical operator certification and biomedical first-line maintenance.',
      priceEstimate,
      status: publishStatus,
      featured: true,
      seo: {
        title: seoTitle || name,
        description: seoDescription || shortDescription,
      },
    };

    try {
      if (editId) {
        await api.updateProduct(targetDocId || editId, payload);
      } else {
        await api.createProduct(payload);
      }
      setSuccessMsg(`Equipment specifications successfully saved as ${publishStatus}! Redirecting to catalog...`);
      setFloatingToast({
        type: 'success',
        message: `Equipment specifications successfully saved as ${publishStatus}! Redirecting...`,
      });
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save equipment specifications:', err);
      const errMsg = err.message || 'Failed to save equipment specifications to server. Please verify authentication.';
      setErrorMsg(errMsg);
      setFloatingToast({
        type: 'error',
        message: errMsg,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Equipment Catalog</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-sky-600" />
            {editId ? 'Edit Medical Equipment System' : 'Register New Medical Equipment System'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dynamic engineering specifications (Parameter | Value | Unit), media assets, and compliance documentation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={saving || loadingProduct}
            onClick={() => handleSubmit('Draft')}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white dark:bg-[#0A1C2E] hover:bg-slate-50 dark:bg-[#163A5C] text-slate-700 dark:text-slate-300 text-xs font-bold transition shadow-xs disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={saving || loadingProduct}
            onClick={() => handleSubmit('Published')}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Publish to Catalog</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loadingProduct ? (
        <div className="bg-white dark:bg-[#0A1C2E] p-16 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Loading Equipment Details...</h3>
            <p className="text-xs text-slate-500 mt-1">Retrieving existing engineering specifications, images, and documents.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
        
        {/* Section 1: Basic System Information */}
        <div className="bg-white dark:bg-[#0A1C2E] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-4 h-4 text-sky-600" />
            1. Basic System & Classification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Equipment / Device Name <span className="text-rose-500">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Critical Care ICU Ventilator Workstation"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition ${
                  fieldErrors.name
                    ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20 text-rose-950 placeholder:text-rose-300'
                    : 'border-slate-300 focus:ring-2 focus:ring-sky-500'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                SKU / Catalog Number <span className="text-rose-500">*</span>
              </label>
              <input
                ref={skuInputRef}
                type="text"
                required
                value={sku}
                onChange={(e) => handleSkuChange(e.target.value)}
                placeholder="MLE-VENT-9000"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-medium focus:outline-none transition ${
                  fieldErrors.sku
                    ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20 text-rose-950 placeholder:text-rose-300'
                    : 'border-slate-300 focus:ring-2 focus:ring-sky-500'
                }`}
              />
              {fieldErrors.sku && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.sku}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Model Series
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="MedVent-9000 Pro"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Primary Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white dark:bg-[#0A1C2E] font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="ICU Ventilators, Hematology, etc."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Manufacturer / Brand OEM
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Medlab Engineering OEM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Institutional Price Estimate
              </label>
              <input
                type="text"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                placeholder="$18,500 - $24,500 / Unit"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Short Summary Description (for Catalog Cards)
            </label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="High-performance turbine-driven invasive and non-invasive mechanical ICU ventilator with integrated HFNC."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Full Engineering & Clinical Overview
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive technical description of the equipment architecture, pneumatic or fluidic systems, and diagnostic capabilities..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Section 2: Dynamic Technical Specifications Builder (Parameter | Value | Unit) */}
        <div className="bg-white dark:bg-[#0A1C2E] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-600" />
                2. Dynamic Engineering Specifications (Section 8 Standard)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic fields allowing distinct equipment types (e.g. RPM, flow rates, wavelength) to be compared precisely.
              </p>
            </div>
            <button
              type="button"
              onClick={addSpecRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition border border-sky-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Specification Row</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider px-1">
              <div className="col-span-5">Parameter</div>
              <div className="col-span-4">Value</div>
              <div className="col-span-2">Unit</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {specifications.map((s, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="e.g. Maximum Speed or Tidal Volume"
                    value={s.parameter}
                    onChange={(e) => updateSpecRow(idx, 'parameter', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="e.g. 5000 or 2 to 2500"
                    value={s.value}
                    onChange={(e) => updateSpecRow(idx, 'value', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="e.g. RPM or mL"
                    value={s.unit}
                    onChange={(e) => updateSpecRow(idx, 'unit', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeSpecRow(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                    title="Remove Parameter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Features & Applications Dynamic Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Features */}
          <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Key Features List</h3>
              <button
                type="button"
                onClick={addFeature}
                className="text-xs text-sky-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-2.5">
              {features.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={f}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder="e.g. Automatic tube compensation (ATC)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Clinical Applications</h3>
              <button
                type="button"
                onClick={addApp}
                className="text-xs text-sky-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-2.5">
              {applications.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={a}
                    onChange={(e) => updateApp(idx, e.target.value)}
                    placeholder="e.g. Intensive Care Units (ICU)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeApp(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Section 4: Installation, Training & Biomedical Warranty */}
        <div className="bg-white dark:bg-[#0A1C2E] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            3. Installation, Training & Biomedical Warranty
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Biomedical Warranty Details
              </label>
              <textarea
                rows={3}
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="36 Months Complete Biomedical Warranty + 2 Years Free Calibration..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Site Installation Requirements
              </label>
              <textarea
                rows={3}
                value={installationRequirements}
                onChange={(e) => setInstallationRequirements(e.target.value)}
                placeholder="Standard 100-240V AC 50/60Hz, low pressure oxygen or cylinder..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Clinician Training Requirements
              </label>
              <textarea
                rows={3}
                value={trainingRequirements}
                onChange={(e) => setTrainingRequirements(e.target.value)}
                placeholder="On-site clinician and biomedical technician operational certification..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Media Assets & Compliance Documents */}
        <div className="bg-white dark:bg-[#0A1C2E] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-sky-600" />
              4. Media Assets & Compliance Documents
            </h2>
            <span className="text-[11px] font-medium text-slate-400">
              Cloud CDN Storage
            </span>
          </div>

          {/* Primary Product Image Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Primary Product Image <span className="text-rose-500">*</span>
              </label>
              {mainImageUrl && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace Image</span>
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={uploadingImage}
              onChange={handleProductImageUpload}
              className="hidden"
            />

            {/* If an image is selected/uploaded: Show rich preview card */}
            {mainImageUrl ? (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#163A5C] bg-slate-50/60 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* Image thumbnail / preview */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl border border-slate-200 dark:border-[#163A5C] bg-white dark:bg-[#0A1C2E] overflow-hidden shadow-xs shrink-0 flex items-center justify-center group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainImageUrl}
                    alt="Product preview"
                    className="w-full h-full object-contain p-2"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                      <span className="text-[11px] font-bold text-sky-700">Updating...</span>
                    </div>
                  )}
                </div>

                {/* Details & Actions */}
                <div className="flex-1 min-w-0 w-full space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Image Attached
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white dark:bg-[#0A1C2E] hover:bg-slate-50 dark:bg-[#163A5C] text-slate-700 dark:text-slate-300 text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
                        <span>Upload New</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMainImageUrl('');
                          setUploadSuccess(null);
                          setUploadError(null);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Direct URL input with Copy button */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Direct Image URL (editable)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mainImageUrl}
                        onChange={(e) => setMainImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-[#0A1C2E]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(mainImageUrl);
                          setUploadSuccess('Image URL copied to clipboard!');
                          setTimeout(() => setUploadSuccess(null), 2500);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-[#0A1C2E] hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold transition shrink-0"
                        title="Copy URL"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Dropzone when no image is uploaded */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  isDragging
                    ? 'border-sky-500 bg-sky-50/60 scale-[1.005]'
                    : 'border-slate-300 hover:border-sky-500 bg-slate-50/60 hover:bg-sky-50/30'
                }`}
              >
                {uploadingImage ? (
                  <div className="py-4 flex flex-col items-center gap-2.5">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Uploading image to CDN...
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Optimizing and generating permanent cloud URL
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-sky-100/80 text-sky-600 flex items-center justify-center mb-3 shadow-xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      Click to upload image or drag & drop here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      PNG, JPG, JPEG, WEBP or GIF (Max 20MB)
                    </p>
                    <button
                      type="button"
                      className="mt-3.5 px-4 py-1.5 rounded-lg bg-white dark:bg-[#0A1C2E] border border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs hover:bg-slate-50 dark:bg-[#163A5C] transition"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Manual URL Input fallback if user doesn't have local image yet */}
            {!mainImageUrl && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">Or paste an existing image URL directly:</span>
                </div>
                <input
                  type="text"
                  value={mainImageUrl}
                  onChange={(e) => setMainImageUrl(e.target.value)}
                  placeholder="https://imgh.in/images/... or /images/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-[#0A1C2E]"
                />
              </div>
            )}

            {/* In-place feedback alerts */}
            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="underline text-xs font-bold text-rose-700 hover:text-rose-900"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Brochure & Service Manual 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-100">
            {/* Brochure Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#163A5C] bg-slate-50/60 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                Product Brochure PDF
              </label>

              {/* Hidden file input */}
              <input
                ref={brochureFileRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleBrochureUpload}
                className="hidden"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={brochureUrl}
                  onChange={(e) => setBrochureUrl(e.target.value)}
                  placeholder="Paste URL or upload PDF directly..."
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-[#0A1C2E]"
                />
                <button
                  type="button"
                  disabled={uploadingBrochure}
                  onClick={() => brochureFileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition shrink-0 disabled:opacity-50"
                  title="Upload PDF directly to Google Drive"
                >
                  {uploadingBrochure ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload PDF</span>
                    </>
                  )}
                </button>
              </div>

              {brochureUploadError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{brochureUploadError}</span>
                  <button
                    type="button"
                    onClick={() => setBrochureUploadError(null)}
                    className="text-rose-500 hover:text-rose-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {brochureUrl && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <a
                    href={brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold underline truncate max-w-[260px]"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span>View / Test Brochure Link</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setBrochureUrl('')}
                    className="text-slate-400 hover:text-rose-600 transition text-[11px] font-medium"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Service Manual Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#163A5C] bg-slate-50/60 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-sky-600" />
                Service Manual PDF
              </label>

              {/* Hidden file input */}
              <input
                ref={manualFileRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleManualUpload}
                className="hidden"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="Paste URL or upload PDF directly..."
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-[#0A1C2E]"
                />
                <button
                  type="button"
                  disabled={uploadingManual}
                  onClick={() => manualFileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition shrink-0 disabled:opacity-50"
                  title="Upload PDF directly to Google Drive"
                >
                  {uploadingManual ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload PDF</span>
                    </>
                  )}
                </button>
              </div>

              {manualUploadError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{manualUploadError}</span>
                  <button
                    type="button"
                    onClick={() => setManualUploadError(null)}
                    className="text-rose-500 hover:text-rose-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {manualUrl && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <a
                    href={manualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold underline truncate max-w-[260px]"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span>View / Test Manual Link</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setManualUrl('')}
                    className="text-slate-400 hover:text-rose-600 transition text-[11px] font-medium"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 6: SEO & URL Slug */}
        <div className="bg-white dark:bg-[#0A1C2E] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-sky-600" />
            5. SEO & Permanent Slug Optimization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="medvent-9000-pro-icu-ventilator"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="MedVent-9000 Pro ICU Ventilator | Medlab Innovate"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Error / Success Feedback Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-rose-900">Please review the required fields</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{errorMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!name.trim()) focusAndScrollField('name');
                else if (!sku.trim()) focusAndScrollField('sku');
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <span>Scroll to Field</span>
              <span>&uarr;</span>
            </button>
          </div>
        )}

        {/* Bottom Bar Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#163A5C]">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit('Draft')}
            className="px-6 py-3 rounded-xl border border-slate-300 bg-white dark:bg-[#0A1C2E] hover:bg-slate-50 dark:bg-[#163A5C] active:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit('Published')}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold transition shadow-lg shadow-sky-600/30 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Publishing...' : 'Publish Equipment System'}</span>
          </button>
        </div>

        </div>
      )}

      {/* Floating Toast Notification (Always in view wherever user scrolls) */}
      {floatingToast && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div
            className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 ${
              floatingToast.type === 'error'
                ? 'bg-rose-900/95 text-white border-rose-700/80 shadow-rose-950/30'
                : 'bg-emerald-900/95 text-white border-emerald-700/80 shadow-emerald-950/30'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
              {floatingToast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-300" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-snug">
                {floatingToast.type === 'error' ? 'Validation Error' : 'Success!'}
              </p>
              <p className="text-[11px] text-white/80 mt-0.5 leading-relaxed">
                {floatingToast.message}
              </p>

              {floatingToast.actionField && (
                <button
                  type="button"
                  onClick={() => focusAndScrollField(floatingToast.actionField!)}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition shadow-xs"
                >
                  <span>Fix {floatingToast.actionField === 'name' ? 'Device Name' : 'SKU'}</span>
                  <span>&uarr;</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFloatingToast(null)}
              className="text-white/60 hover:text-white p-1 rounded-md transition"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNewProductPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-5xl mx-auto py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          <p className="text-xs font-semibold text-slate-500">Loading equipment editor...</p>
        </div>
      }
    >
      <ProductFormInner />
    </React.Suspense>
  );
}
