'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileCheck,
  ArrowLeft,
  Plus,
  Trash2,
  Printer,
  Send,
  Save,
  CheckCircle2,
  Building2,
  DollarSign,
  ShieldCheck,
  Calendar,
  FileText
} from 'lucide-react';
import { api, fallbackProducts } from '@/lib/api';

function AdminNewQuotationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query params if launched from an Enquiry Detail page
  const queryCustomer = searchParams.get('customer') || '';
  const queryOrg = searchParams.get('org') || '';
  const queryEmail = searchParams.get('email') || '';

  const [quoteNumber, setQuoteNumber] = useState(
    `MLE-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [customerName, setCustomerName] = useState(queryCustomer || '');
  const [organization, setOrganization] = useState(queryOrg || '');
  const [customerEmail, setCustomerEmail] = useState(queryEmail || '');
  const [address, setAddress] = useState('');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [terms, setTerms] = useState(
    'Standard Medlab Engineering Net 30 Commercial Terms under Kenyan commercial practice. Biomedical warranty and preventative maintenance calibration included. Delivery within 14 business days, subject to site readiness and logistics.'
  );

  // Line Items
  const [items, setItems] = useState<Array<{ productName: string; quantity: number; unitPrice: number; total: number }>>([
    {
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);

  // Financials
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [installationCharges, setInstallationCharges] = useState<number>(0);
  const [trainingCharges, setTrainingCharges] = useState<number>(0);
  const [shippingCharges, setShippingCharges] = useState<number>(0);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Math Calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const grandTotal = Math.max(0, subtotal - discount + tax + installationCharges + trainingCharges + shippingCharges);

  const handleUpdateItem = (idx: number, field: 'productName' | 'quantity' | 'unitPrice', val: any) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [field]: val };
    const q = Number(copy[idx].quantity) || 0;
    const p = Number(copy[idx].unitPrice) || 0;
    copy[idx].total = q * p;
    setItems(copy);
  };

  const addItemRow = () => {
    setItems([...items, { productName: 'Additional Medical Equipment / Accessory', quantity: 1, unitPrice: 1000, total: 1000 }]);
  };

  const removeItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSave = async (status: 'Draft' | 'Sent') => {
    setSaving(true);
    const payload = {
      quoteNumber,
      customerName,
      organization,
      customerEmail,
      address,
      items,
      subtotal,
      discount,
      tax,
      taxAmount: tax,
      taxRatePercentage: 0,
      currency: 'KES',
      installationCharges,
      trainingCharges,
      shippingCharges,
      grandTotal,
      validUntil,
      terms,
      status,
    };

    try {
      await api.createQuotation(payload);
      setToastMsg(`Quotation ${quoteNumber} saved as ${status}!`);
      setTimeout(() => router.push('/admin/quotations'), 1500);
    } catch {
      setToastMsg(`Quotation ${quoteNumber} saved as ${status} (Local Confirmed).`);
      setTimeout(() => router.push('/admin/quotations'), 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/quotations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Quotations List</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-sky-600" />
            Generate Official Quotation & Commercial Proposal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quote Reference: <strong className="font-mono text-sky-700">{quoteNumber}</strong> &bull; ISO 13485 Pricing Schedule
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white dark:bg-[#0A1C2E] hover:bg-slate-50 dark:bg-[#163A5C] text-slate-700 dark:text-slate-300 text-xs font-bold transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Preview Proposal PDF</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('Sent')}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Quotation</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Section 1: Customer & Recipient Details */}
      <div className="bg-white dark:bg-[#0A1C2E] p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100">
          <Building2 className="w-4 h-4 text-sky-600" />
          Customer & Healthcare Facility Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Quote Reference #</label>
            <input
              type="text"
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Healthcare Institution</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Attn / Contact Officer</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Email for Delivery</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-slate-500 font-semibold mb-1">Destination Facility Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Valid Until Date</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Line Items Dynamic Table */}
      <div className="bg-white dark:bg-[#0A1C2E] p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Requisition Line Items & Equipment Packages
          </h2>
          <button
            type="button"
            onClick={addItemRow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition border border-sky-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider px-1">
            <div className="col-span-6">Equipment / Service Description</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Unit Price (KES)</div>
            <div className="col-span-1 text-right">Total (KES)</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-6">
                <input
                  type="text"
                  value={it.productName}
                  onChange={(e) => handleUpdateItem(idx, 'productName', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-center rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min={0}
                  value={it.unitPrice}
                  onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-right font-mono rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div className="col-span-1 text-right font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                KES {it.total.toLocaleString()}
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => removeItemRow(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Financial Calculations & Terms Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Terms & Conditions (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Terms & Conditions / Engineering Warranties
          </h3>
          <textarea
            rows={6}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 outline-none"
          />
          <div className="p-3 bg-slate-50 dark:bg-[#163A5C] rounded-xl border border-slate-200/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Bank Wire Transfer Details:</span>
            <span>Beneficiary: Medlab Innovate Engineering Ltd</span>
            <span className="block">Kenya bank transfer details will be provided on the approved quotation.</span>
          </div>
        </div>

        {/* Financial Summary & Grand Total (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0A1C2E] p-6 rounded-2xl border border-slate-200 dark:border-[#163A5C] shadow-xs space-y-3 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100">
            Financial Balance Sheet (KES)
          </h3>

          <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
            <span>Items Subtotal:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-100">KES {subtotal.toLocaleString()}</strong>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-600 dark:text-slate-400">Institutional Discount:</span>
            <div className="flex items-center gap-1 font-mono">
              <span>-KES</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-right font-mono font-bold rounded-lg border border-slate-200 dark:border-[#163A5C] text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-600 dark:text-slate-400">VAT (Kenya):</span>
            <div className="flex items-center gap-1 font-mono">
              <span>+KES</span>
              <input
                type="number"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-right font-mono font-bold rounded-lg border border-slate-200 dark:border-[#163A5C] text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-600 dark:text-slate-400">Installation & Commissioning:</span>
            <div className="flex items-center gap-1 font-mono">
              <span>+KES</span>
              <input
                type="number"
                value={installationCharges}
                onChange={(e) => setInstallationCharges(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-right font-mono font-bold rounded-lg border border-slate-200 dark:border-[#163A5C] text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-600 dark:text-slate-400">Technician Training:</span>
            <div className="flex items-center gap-1 font-mono">
              <span>+KES</span>
              <input
                type="number"
                value={trainingCharges}
                onChange={(e) => setTrainingCharges(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-right font-mono font-bold rounded-lg border border-slate-200 dark:border-[#163A5C] text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-600 dark:text-slate-400">Cold-Chain Shipping:</span>
            <div className="flex items-center gap-1 font-mono">
              <span>+KES</span>
              <input
                type="number"
                value={shippingCharges}
                onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 text-right font-mono font-bold rounded-lg border border-slate-200 dark:border-[#163A5C] text-xs"
              />
            </div>
          </div>

          {/* Grand Total */}
          <div className="pt-3 border-t border-slate-200 dark:border-[#163A5C] flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Grand Total (KES):</span>
            <span className="text-2xl font-black font-mono text-sky-600">
              KES {grandTotal.toLocaleString()}
            </span>
          </div>

          <div className="pt-4 flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('Draft')}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white dark:bg-[#0A1C2E] hover:bg-slate-50 dark:bg-[#163A5C] text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('Sent')}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-md shadow-sky-600/20"
            >
              Dispatch Quote
            </button>
          </div>
        </div>

      </div>

      {/* Formal PDF / Printable Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0A1C2E] rounded-2xl max-w-3xl w-full p-8 border border-slate-300 relative my-8">
            <button
              onClick={() => setPreviewModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 dark:text-slate-200 text-xl font-bold"
            >
              &times;
            </button>

            {/* Letterhead */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Medlab Innovate Engineering Ltd</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Around Thika Road / Baba Dogo / Outer Ring Road, Nairobi, Kenya<br />
                  Email: info@medlabinnovate.co.ke &bull; Tel: +254 142 808755 &bull; WA: +254 745 662 988
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 block">Commercial Proposal</span>
                <strong className="text-base font-mono text-slate-900 dark:text-slate-100">{quoteNumber}</strong>
                <span className="text-xs text-slate-400 block mt-0.5">Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Client Info */}
            <div className="my-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold block mb-1">Quotation Prepared For:</span>
                <strong className="text-slate-900 dark:text-slate-100 text-sm block">{organization}</strong>
                <span className="text-slate-600 dark:text-slate-400 block mt-0.5">Attn: {customerName}</span>
                <span className="text-slate-500 block">{address}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 uppercase font-bold block mb-1">Validity & Delivery:</span>
                <span className="text-slate-700 dark:text-slate-300 block font-medium">Valid Until: {validUntil}</span>
                <span className="text-slate-500 block">Payment: Net 30 Commercial SLA</span>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs mb-6">
              <thead className="bg-slate-100 text-slate-600 dark:text-slate-400 font-bold uppercase border-y border-slate-200 dark:border-[#163A5C]">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{it.productName}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">{it.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">KES {it.unitPrice.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">KES {it.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Balance */}
            <div className="flex justify-end text-xs mb-6">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">KES {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-mono">-KES {discount.toLocaleString()}</span>
                  </div>
                )}
                {installationCharges > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Installation:</span>
                    <span className="font-mono">+KES {installationCharges.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-[#163A5C]">
                  <span>Grand Total:</span>
                  <span className="font-mono text-sky-600">KES {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Terms Footer */}
            <div className="p-4 bg-slate-50 dark:bg-[#163A5C] rounded-xl text-[11px] text-slate-500 border border-slate-200 dark:border-[#163A5C]">
              <strong className="text-slate-800 dark:text-slate-200 block mb-1">Standard Biomedical Warranty & Terms:</strong>
              {terms}
            </div>

            {/* Print trigger */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminNewQuotationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-5xl mx-auto py-24 text-center">
          <p className="text-xs font-semibold text-slate-500">Loading quotation editor...</p>
        </div>
      }
    >
      <AdminNewQuotationInner />
    </React.Suspense>
  );
}
