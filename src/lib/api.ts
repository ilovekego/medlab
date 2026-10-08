/**
 * Medlab Innovate Engineering Ltd — Firebase-Native API Layer
 * All data reads/writes go directly to Firestore. No backend needed.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { IProduct, ICategory, IBrand, IEnquiry, IQuotation, ISupportTicket, ICustomer, IUser } from './types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function docToObject<T>(snap: DocumentData): T {
  const data = snap.data ? snap.data() : snap;
  return { ...data, _id: snap.id, id: snap.id } as T;
}

// ─────────────────────────────────────────────
// FALLBACK DATA (when Firestore is empty)
// ─────────────────────────────────────────────
export const fallbackProducts: IProduct[] = [];

export const fallbackCategories: ICategory[] = [
  { name: 'Hospital Medical Equipment', slug: 'hospital-medical-equipment', order: 1, subcategories: ['ICU Ventilators', 'Patient Monitoring', 'Ultrasound Imaging', 'Electrosurgical Units', 'Defibrillators', 'ECG Machines'] },
  { name: 'Laboratory Equipment', slug: 'laboratory-equipment', order: 2, subcategories: ['Hematology Analyzers', 'Clinical Chemistry', 'Refrigerated Centrifuges', 'Biosafety Cabinets'] },
  { name: 'Analytical Instruments', slug: 'analytical-instruments', order: 3, subcategories: ['Real-Time PCR', 'UV-Vis Spectrophotometers', 'Chromatography'] },
  { name: 'Molecular Biology & Life Science Equipment', slug: 'molecular-biology-life-science-equipment', order: 4, subcategories: ['Thermal Cyclers (PCR)', 'Electrophoresis Systems', 'Gel Documentation', 'DNA/RNA Extraction', 'Automated Liquid Handlers', 'Incubator Shakers'] },
  { name: 'General Research & Scientific Equipment', slug: 'general-research-scientific-equipment', order: 5, subcategories: ['Laboratory Ovens', 'Autoclaves & Sterilizers', 'Magnetic Stirrers & Hotplates', 'Precision Balances', 'Ultrasonic Baths', 'Microscopes'] },
  { name: 'Consumables & Accessories', slug: 'consumables-and-accessories', order: 6, subcategories: ['Reagents & Lyse Packs', 'SpO2 & ECG Cables', 'Vacuum Collection Tubes'] },
  { name: 'Engineering Solutions', slug: 'engineering-solutions', order: 7, subcategories: ['Medical Gas Pipeline (MGPS)', 'Modular Cleanrooms', 'Medical Isolated UPS'] },
];

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────
async function getProducts(params = ''): Promise<{ success: boolean; data: IProduct[]; pagination: any }> {
  try {
    const urlParams = new URLSearchParams(params.replace(/^\?/, ''));
    const allStatus = urlParams.get('allStatus');
    const status = allStatus ? null : (urlParams.get('status') || 'Published');
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    const featured = urlParams.get('featured');
    const page = Math.max(1, parseInt(urlParams.get('page') || '1', 10));
    const limitNum = Math.max(1, parseInt(urlParams.get('limit') || '12', 10));

    let docs: IProduct[] = [];

    try {
      // Try compound query — works once Firestore composite index is created
      const constraints: QueryConstraint[] = [];
      if (status) constraints.push(where('status', '==', status));
      if (featured !== null && featured !== undefined && featured !== '') {
        constraints.push(where('featured', '==', featured === 'true'));
      }
      // orderBy alone on a single-field query doesn't need a composite index
      if (constraints.length <= 1) constraints.push(orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(query(collection(db, 'products'), ...constraints));
      docs = snapshot.docs.map((d) => docToObject<IProduct>(d));
    } catch (indexErr: any) {
      // Missing composite index — fall back to full collection, filter client-side
      console.warn('[Firestore] Index missing, fetching all products:', indexErr.message);
      const snapshot = await getDocs(collection(db, 'products'));
      docs = snapshot.docs.map((d) => docToObject<IProduct>(d));
    }

    // Always apply client-side filters (safe, no index needed)
    if (status) docs = docs.filter((p) => p.status === status);
    if (category && category !== 'all') {
      const cat = category.toLowerCase();
      docs = docs.filter((p) => p.category?.toLowerCase() === cat);
    }
    if (featured !== null && featured !== undefined && featured !== '') {
      docs = docs.filter((p) => p.featured === (featured === 'true'));
    }
    if (search) {
      const s = search.toLowerCase();
      docs = docs.filter(
        (p) =>
          p.name?.toLowerCase().includes(s) ||
          p.model?.toLowerCase().includes(s) ||
          p.sku?.toLowerCase().includes(s) ||
          p.shortDescription?.toLowerCase().includes(s)
      );
    }

    // Client-side sort by createdAt descending
    docs.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
      return bTime - aTime;
    });

    const total = docs.length;
    const paginated = docs.slice((page - 1) * limitNum, page * limitNum);
    return { success: true, data: paginated, pagination: { page, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } };
  } catch (err: any) {
    console.warn('[Firestore] getProducts error:', err.message);
    return { success: true, data: fallbackProducts, pagination: { page: 1, limit: 12, total: 0, totalPages: 1 } };
  }
}


async function getProductById(idOrSlug: string): Promise<{ success: boolean; data: IProduct }> {
  try {
    if (!idOrSlug) throw new Error('Product ID or slug is required');

    // 1. Try directly by Firestore document ID
    try {
      const snap = await getDoc(doc(db, 'products', idOrSlug));
      if (snap.exists()) {
        return { success: true, data: docToObject<IProduct>(snap) };
      }
    } catch {
      // Continue to query fallbacks
    }

    // 2. Try querying by slug
    try {
      const qSlug = query(collection(db, 'products'), where('slug', '==', idOrSlug), limit(1));
      const snapSlug = await getDocs(qSlug);
      if (!snapSlug.empty) {
        return { success: true, data: docToObject<IProduct>(snapSlug.docs[0]) };
      }
    } catch {
      // Continue
    }

    // 3. Try querying by SKU
    try {
      const qSku = query(collection(db, 'products'), where('sku', '==', idOrSlug), limit(1));
      const snapSku = await getDocs(qSku);
      if (!snapSku.empty) {
        return { success: true, data: docToObject<IProduct>(snapSku.docs[0]) };
      }
    } catch {
      // Continue
    }

    // 4. Try querying by custom '_id' or 'id'
    try {
      const qId = query(collection(db, 'products'), where('_id', '==', idOrSlug), limit(1));
      const snapId = await getDocs(qId);
      if (!snapId.empty) {
        return { success: true, data: docToObject<IProduct>(snapId.docs[0]) };
      }
    } catch {
      // Continue
    }

    // 5. Fallback products check
    const fallbackMatch = fallbackProducts.find(
      (p) => p._id === idOrSlug || p.id === idOrSlug || p.slug === idOrSlug || p.sku === idOrSlug
    );
    if (fallbackMatch) {
      return { success: true, data: fallbackMatch };
    }

    throw new Error('Product not found in database');
  } catch (err: any) {
    throw new Error(err.message || 'Product not found');
  }
}

async function getProductBySlug(slug: string): Promise<{ success: boolean; data: IProduct; related: IProduct[] }> {
  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Product not found');
    const product = docToObject<IProduct>(snap.docs[0]);
    const relQ = query(collection(db, 'products'), where('category', '==', product.category), where('status', '==', 'Published'), limit(4));
    const relSnap = await getDocs(relQ);
    const related = relSnap.docs.map((d) => docToObject<IProduct>(d)).filter((p) => p._id !== product._id).slice(0, 3);
    return { success: true, data: product, related };
  } catch (err: any) {
    throw new Error(err.message || 'Product not found');
  }
}

async function createProduct(data: Partial<IProduct>): Promise<{ success: boolean; data: IProduct }> {
  if (!data.slug && data.name) {
    data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  const docRef = await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { success: true, data: { ...data, _id: docRef.id, id: docRef.id } as unknown as IProduct };
}

async function updateProduct(id: string, data: Partial<IProduct>): Promise<{ success: boolean; data: IProduct }> {
  try {
    await updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() });
  } catch (err: any) {
    await setDoc(doc(db, 'products', id), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
  }
  return { success: true, data: { ...data, _id: id, id } as IProduct };
}

async function deleteProduct(id: string): Promise<{ success: boolean }> {
  await deleteDoc(doc(db, 'products', id));
  return { success: true };
}

async function duplicateProduct(id: string): Promise<{ success: boolean; data: IProduct }> {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) throw new Error('Product not found');
  const original = snap.data() as IProduct;
  const suffix = Math.floor(100 + Math.random() * 900);
  const newData = { ...original, name: `${original.name} (Copy)`, sku: `${original.sku}-COPY-${suffix}`, slug: `${original.slug}-copy-${suffix}`, status: 'Draft' as const, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, 'products'), newData);
  return { success: true, data: { ...newData, _id: docRef.id, id: docRef.id } as unknown as IProduct };
}

// ─────────────────────────────────────────────
// CATEGORIES & BRANDS
// ─────────────────────────────────────────────
async function getCategories(): Promise<{ success: boolean; data: ICategory[] }> {
  try {
    const snap = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));
    const data = snap.docs.map((d) => docToObject<ICategory>(d));
    return { success: true, data: data.length > 0 ? data : fallbackCategories };
  } catch {
    return { success: true, data: fallbackCategories };
  }
}

async function createCategory(data: Partial<ICategory>): Promise<{ success: boolean; data: ICategory }> {
  const docRef = await addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp() });
  return { success: true, data: { ...data, _id: docRef.id, id: docRef.id } as ICategory };
}

async function deleteCategory(id: string): Promise<{ success: boolean }> {
  await deleteDoc(doc(db, 'categories', id));
  return { success: true };
}

async function getBrands(): Promise<{ success: boolean; data: IBrand[] }> {
  try {
    const snap = await getDocs(collection(db, 'brands'));
    return { success: true, data: snap.docs.map((d) => docToObject<IBrand>(d)) };
  } catch {
    return { success: true, data: [] };
  }
}

// ─────────────────────────────────────────────
// ENQUIRIES
// ─────────────────────────────────────────────
async function getEnquiries(params = ''): Promise<{ success: boolean; data: IEnquiry[]; pagination: any }> {
  try {
    const urlParams = new URLSearchParams(params.replace(/^\?/, ''));
    const status = urlParams.get('status');
    const search = urlParams.get('search');
    const page = Math.max(1, parseInt(urlParams.get('page') || '1', 10));
    const limitNum = Math.max(1, parseInt(urlParams.get('limit') || '15', 10));
    let docs: IEnquiry[] = [];
    try {
      const snap = await getDocs(query(collection(db, 'enquiries'), orderBy('createdAt', 'desc')));
      docs = snap.docs.map((d) => docToObject<IEnquiry>(d));
    } catch {
      const snap = await getDocs(collection(db, 'enquiries'));
      docs = snap.docs.map((d) => docToObject<IEnquiry>(d));
    }
    if (status && status !== 'all') docs = docs.filter((e) => e.status === status);
    if (search) {
      const s = search.toLowerCase();
      docs = docs.filter((e) => e.customerName?.toLowerCase().includes(s) || e.organization?.toLowerCase().includes(s) || e.enquiryId?.toLowerCase().includes(s));
    }
    docs.sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime();
    });
    const total = docs.length;
    return { success: true, data: docs.slice((page - 1) * limitNum, page * limitNum), pagination: { page, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } };
  } catch {
    return { success: true, data: [], pagination: { page: 1, limit: 15, total: 0, totalPages: 1 } };
  }
}

async function getEnquiryById(id: string): Promise<{ success: boolean; data: IEnquiry }> {
  const snap = await getDoc(doc(db, 'enquiries', id));
  if (!snap.exists()) throw new Error('Enquiry not found');
  return { success: true, data: docToObject<IEnquiry>(snap) };
}

async function createEnquiry(data: any): Promise<{ success: boolean; data: IEnquiry; message: string }> {
  const enquiryId = `MLE-ENQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const docData = {
    ...data,
    enquiryId,
    status: 'New',
    installationRequired: data.installationRequired ?? true,
    trainingRequired: data.trainingRequired ?? true,
    timeline: [{ event: 'Submitted', description: 'Enquiry received via website', timestamp: new Date().toISOString() }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, 'enquiries'), docData);

  const customerEmail = String(data.emailAddress || data.email || '').trim().toLowerCase();
  if (customerEmail) {
    const customerSnapshot = await getDocs(
      query(collection(db, 'customers'), where('email', '==', customerEmail), limit(1))
    );
    const customerData = {
      name: data.customerName || '',
      organization: data.organization || '',
      customerType: data.customerType || 'Healthcare Facility',
      phone: data.phoneNumber || data.phone || '',
      email: customerEmail,
      location: data.location || '',
      address: data.address || '',
      lastActivity: serverTimestamp(),
    };

    if (customerSnapshot.empty) {
      await addDoc(collection(db, 'customers'), {
        ...customerData,
        totalEnquiries: 1,
        totalQuotations: 0,
        supportTickets: 0,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(customerSnapshot.docs[0].ref, {
        ...customerData,
        totalEnquiries: (customerSnapshot.docs[0].data().totalEnquiries || 0) + 1,
      });
    }
  }

  // Fire-and-forget Web3Forms notification
  const isGeneralContact = String(data.source || '').toLowerCase() === 'website contact form';
  const web3FormsKey = isGeneralContact
    ? process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
    : process.env.NEXT_PUBLIC_WEB3FORMS_RFQ_ACCESS_KEY;
  if (web3FormsKey && web3FormsKey !== 'your_web3forms_access_key') {
    const notificationPayload = {
      access_key: web3FormsKey,
      subject: isGeneralContact
        ? `MEDLAB GENERAL CONTACT FORM - ${data.organization || 'Website visitor'}`
        : `MEDLAB RFQ ENQUIRY - ${data.organization || 'Healthcare client'} - ${enquiryId}`,
      enquiryId,
      name: data.customerName,
      organization: data.organization,
      phone: data.phoneNumber || data.phone,
      email: data.emailAddress || data.email,
      location: data.location,
      ...(isGeneralContact
        ? {
            department: String(data.additionalRequirements || '').replace(/^Department:\s*/i, '').split('. Message:')[0],
            message: String(data.additionalRequirements || '').split('Message:')[1]?.trim() || '',
          }
        : {
            equipment: data.equipmentSummary,
            quantity: data.quantityTotal,
            specifications: data.requiredSpecifications || '',
            installation: data.installationRequired ? 'Yes' : 'No',
            training: data.trainingRequired ? 'Yes' : 'No',
            notes: data.additionalRequirements || '',
          }),
    };

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(notificationPayload),
    }).catch((err) => console.warn('[Web3Forms] Enquiry notification failed:', err));
  }

  return { success: true, data: { ...docData, _id: docRef.id, id: docRef.id, enquiryId } as IEnquiry, message: 'Enquiry submitted successfully.' };
}

async function updateEnquiry(id: string, data: any): Promise<{ success: boolean; data: IEnquiry }> {
  await updateDoc(doc(db, 'enquiries', id), { ...data, updatedAt: serverTimestamp() });
  return { success: true, data: { ...data, _id: id, id } as IEnquiry };
}

// ─────────────────────────────────────────────
// QUOTATIONS
// ─────────────────────────────────────────────
async function getQuotations(params = ''): Promise<{ success: boolean; data: IQuotation[]; pagination: any }> {
  try {
    const urlParams = new URLSearchParams(params.replace(/^\?/, ''));
    const page = Math.max(1, parseInt(urlParams.get('page') || '1', 10));
    const limitNum = Math.max(1, parseInt(urlParams.get('limit') || '15', 10));
    const status = urlParams.get('status');
    let docs: IQuotation[] = [];
    try {
      const snap = await getDocs(query(collection(db, 'quotations'), orderBy('createdAt', 'desc')));
      docs = snap.docs.map((d) => docToObject<IQuotation>(d));
    } catch {
      const snap = await getDocs(collection(db, 'quotations'));
      docs = snap.docs.map((d) => docToObject<IQuotation>(d));
    }
    if (status && status !== 'all') docs = docs.filter((q) => q.status === status);
    docs.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
    const total = docs.length;
    return { success: true, data: docs.slice((page - 1) * limitNum, page * limitNum), pagination: { page, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } };
  } catch {
    return { success: true, data: [], pagination: { page: 1, limit: 15, total: 0, totalPages: 1 } };
  }
}

async function getQuotationById(id: string): Promise<{ success: boolean; data: IQuotation }> {
  const snap = await getDoc(doc(db, 'quotations', id));
  if (!snap.exists()) throw new Error('Quotation not found');
  return { success: true, data: docToObject<IQuotation>(snap) };
}

async function createQuotation(data: any): Promise<{ success: boolean; data: IQuotation; message: string }> {
  const quoteNumber = `MLE-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const docRef = await addDoc(collection(db, 'quotations'), { ...data, quoteNumber, status: 'Draft', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { success: true, data: { ...data, _id: docRef.id, id: docRef.id, quoteNumber } as IQuotation, message: 'Quotation created.' };
}

async function updateQuotation(id: string, data: any): Promise<{ success: boolean; data: IQuotation }> {
  await updateDoc(doc(db, 'quotations', id), { ...data, updatedAt: serverTimestamp() });
  return { success: true, data: { ...data, _id: id, id } as IQuotation };
}

async function deleteQuotation(id: string): Promise<{ success: boolean }> {
  await deleteDoc(doc(db, 'quotations', id));
  return { success: true };
}

async function sendQuotationEmail(id: string): Promise<{ success: boolean; message: string }> {
  const web3FormsKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (web3FormsKey && web3FormsKey !== 'your_web3forms_access_key') {
    const snap = await getDoc(doc(db, 'quotations', id));
    if (snap.exists()) {
      const q = snap.data() as any;
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: web3FormsKey,
          subject: `Quotation ${q.quoteNumber} - ${q.customer?.organization || 'Healthcare client'}`,
          quoteNumber: q.quoteNumber,
          customerName: q.customer?.name,
          customerEmail: q.customer?.email,
          organization: q.customer?.organization,
          grandTotal: q.grandTotal,
          currency: q.currency,
        }),
      });
    }
  }
  await updateDoc(doc(db, 'quotations', id), { status: 'Sent', sentAt: serverTimestamp() });
  return { success: true, message: 'Quotation sent.' };
}

async function duplicateQuotation(id: string): Promise<{ success: boolean; data: IQuotation }> {
  const snap = await getDoc(doc(db, 'quotations', id));
  if (!snap.exists()) throw new Error('Quotation not found');
  const original = snap.data();
  const quoteNumber = `MLE-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const docRef = await addDoc(collection(db, 'quotations'), { ...original, quoteNumber, status: 'Draft', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { success: true, data: { ...original, _id: docRef.id, id: docRef.id, quoteNumber } as unknown as IQuotation };
}

// ─────────────────────────────────────────────
// CUSTOMERS (CRM)
// ─────────────────────────────────────────────
async function getCustomers(params = ''): Promise<{ success: boolean; data: ICustomer[]; pagination: any }> {
  try {
    const urlParams = new URLSearchParams(params.replace(/^\?/, ''));
    const page = Math.max(1, parseInt(urlParams.get('page') || '1', 10));
    const limitNum = Math.max(1, parseInt(urlParams.get('limit') || '20', 10));
    const snap = await getDocs(query(collection(db, 'customers'), orderBy('lastActivity', 'desc')));
    let docs = snap.docs.map((d) => docToObject<ICustomer>(d));
    const search = urlParams.get('search');
    if (search) {
      const s = search.toLowerCase();
      docs = docs.filter((c) => c.name?.toLowerCase().includes(s) || c.organization?.toLowerCase().includes(s));
    }
    const total = docs.length;
    return { success: true, data: docs.slice((page - 1) * limitNum, page * limitNum), pagination: { page, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } };
  } catch {
    return { success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
  }
}

async function getCustomerById(id: string): Promise<{ success: boolean; data: { customer: ICustomer; enquiries: IEnquiry[]; quotations: IQuotation[]; tickets: ISupportTicket[] } }> {
  const [custSnap, enqSnap, qtSnap, tickSnap] = await Promise.all([
    getDoc(doc(db, 'customers', id)),
    getDocs(query(collection(db, 'enquiries'), where('customerId', '==', id))),
    getDocs(query(collection(db, 'quotations'), where('customerId', '==', id))),
    getDocs(query(collection(db, 'support_tickets'), where('customerId', '==', id))),
  ]);
  if (!custSnap.exists()) throw new Error('Customer not found');
  return {
    success: true,
    data: {
      customer: docToObject<ICustomer>(custSnap),
      enquiries: enqSnap.docs.map((d) => docToObject<IEnquiry>(d)),
      quotations: qtSnap.docs.map((d) => docToObject<IQuotation>(d)),
      tickets: tickSnap.docs.map((d) => docToObject<ISupportTicket>(d)),
    },
  };
}

// ─────────────────────────────────────────────
// SUPPORT TICKETS
// ─────────────────────────────────────────────
async function getSupportTickets(params = ''): Promise<{ success: boolean; data: ISupportTicket[]; pagination: any }> {
  try {
    const urlParams = new URLSearchParams(params.replace(/^\?/, ''));
    const page = Math.max(1, parseInt(urlParams.get('page') || '1', 10));
    const limitNum = Math.max(1, parseInt(urlParams.get('limit') || '15', 10));
    const status = urlParams.get('status');
    let docs: ISupportTicket[] = [];
    try {
      const snap = await getDocs(query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc')));
      docs = snap.docs.map((d) => docToObject<ISupportTicket>(d));
    } catch {
      const snap = await getDocs(collection(db, 'support_tickets'));
      docs = snap.docs.map((d) => docToObject<ISupportTicket>(d));
    }
    if (status && status !== 'all') docs = docs.filter((t) => t.status === status);
    docs.sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
    const total = docs.length;
    return { success: true, data: docs.slice((page - 1) * limitNum, page * limitNum), pagination: { page, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } };
  } catch {
    return { success: true, data: [], pagination: { page: 1, limit: 15, total: 0, totalPages: 1 } };
  }
}

async function getTicketById(id: string): Promise<{ success: boolean; data: ISupportTicket }> {
  const snap = await getDoc(doc(db, 'support_tickets', id));
  if (!snap.exists()) throw new Error('Ticket not found');
  return { success: true, data: docToObject<ISupportTicket>(snap) };
}

async function createTicket(data: any): Promise<{ success: boolean; data: ISupportTicket; message: string }> {
  const ticketId = `MLE-TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const docRef = await addDoc(collection(db, 'support_tickets'), { ...data, ticketId, status: 'New', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  const web3FormsKey = process.env.NEXT_PUBLIC_WEB3FORMS_SUPPORT_ACCESS_KEY;
  if (web3FormsKey && web3FormsKey !== 'your_web3forms_support_access_key') {
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: web3FormsKey,
        subject: `MEDLAB SUPPORT TICKET - ${data.organization || 'Healthcare client'} - ${ticketId}`,
        ticketId,
        name: data.name || data.customerName,
        email: data.email || data.emailAddress,
        phone: data.phone || data.phoneNumber,
        organization: data.organization,
        equipment: data.equipment || data.equipmentName,
        issueType: data.issueType,
        priority: data.priority,
        description: data.description || data.issueDescription,
      }),
    }).catch((err) => console.warn('[Web3Forms] Support notification failed:', err));
  }
  return { success: true, data: { ...data, _id: docRef.id, id: docRef.id, ticketId } as ISupportTicket, message: 'Support ticket created.' };
}

async function updateTicket(id: string, data: any): Promise<{ success: boolean; data: ISupportTicket }> {
  await updateDoc(doc(db, 'support_tickets', id), { ...data, updatedAt: serverTimestamp() });
  return { success: true, data: { ...data, _id: id, id } as ISupportTicket };
}

// ─────────────────────────────────────────────
// AI CHATBOT — Customer Support & Product Enquiry Assistant
// ─────────────────────────────────────────────
async function sendChatMessage(data: {
  conversationId?: string;
  message: string;
  customer?: any;
  history?: Array<{ sender: string; content: string }>;
}): Promise<{
  success: boolean;
  reply: string;
  conversationId: string;
  suggestedProducts?: any[];
  leadCaptured?: boolean;
  escalateToTicket?: boolean;
}> {
  const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://api.neuralcloud.me/';

  // 1. Fetch live published products from Firestore (Admin updatable without rebuilding)
  let allProducts: IProduct[] = [];
  try {
    const snap = await getDocs(query(collection(db, 'products'), where('status', '==', 'Published'), limit(60)));
    allProducts = snap.docs.map((d) => docToObject<IProduct>(d));
  } catch (err) {
    console.warn('[Firestore] Error fetching published products for AI:', err);
  }

  // 2. Fetch live CMS company profile & contacts from Firestore
  let cmsData: any = {};
  try {
    const cmsSnap = await getDoc(doc(db, 'cms', 'site_config'));
    if (cmsSnap.exists()) cmsData = cmsSnap.data();
  } catch {}

  // 3. Search and rank products matching the query
  const queryTokens = data.message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scoredProducts = allProducts.map((p) => {
    let score = 0;
    const nameStr = (p.name || '').toLowerCase();
    const modelStr = (p.model || '').toLowerCase();
    const catStr = (p.category || '').toLowerCase();
    const subStr = (p.subcategory || '').toLowerCase();
    const descStr = (p.shortDescription || '').toLowerCase();
    const appsStr = (p.applications || []).join(' ').toLowerCase();

    for (const token of queryTokens) {
      if (nameStr.includes(token)) score += 5;
      if (modelStr.includes(token)) score += 5;
      if (catStr.includes(token)) score += 3;
      if (subStr.includes(token)) score += 3;
      if (appsStr.includes(token)) score += 2;
      if (descStr.includes(token)) score += 1;
    }
    return { product: p, score };
  });

  const matchingProducts = scoredProducts
    .filter((sp) => sp.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((sp) => sp.product);

  const suggestedProducts = matchingProducts.length > 0
    ? matchingProducts
    : allProducts.filter((p) => p.featured).slice(0, 3);

  // 4. Build Product Knowledge context
  let productContextText = '';
  if (matchingProducts.length > 0) {
    productContextText = matchingProducts
      .map((p, idx) => {
        const specs = (p.specifications || [])
          .slice(0, 5)
          .map((s) => `${s.parameter}: ${s.value}${s.unit ? ' ' + s.unit : ''}`)
          .join(', ');
        const apps = (p.applications || []).slice(0, 3).join(', ');
        const docs = (p.documents || []).map((d) => `${d.title} (${d.type})`).join(', ');

        return `${idx + 1}. **${p.name}** (Model: ${p.model || 'N/A'}, Category: ${p.category}${p.subcategory ? ' - ' + p.subcategory : ''})
   • Primary Application: ${apps || p.shortDescription || 'Clinical / Diagnostic Medical Use'}
   • Key Specifications: ${specs || 'Consult technical datasheet'}
   ${p.installationRequirements ? `• Installation Requirements: ${p.installationRequirements}` : ''}
   ${p.warranty ? `• Warranty Coverage: ${p.warranty}` : ''}
   ${docs ? `• Available Documents: ${docs}` : ''}`;
      })
      .join('\n\n');
  } else {
    productContextText = `Approved Catalog Categories Available at Medlab Innovate:
1. Hospital Medical Equipment (ICU Ventilators, Multi-parameter Patient Monitors, Ultrasound Imaging, Defibrillators, 12/6/3-Channel ECG Machines, Electrosurgical Units).
2. Laboratory Equipment (5-Part & 3-Part Hematology Analyzers, Clinical Chemistry Analyzers, Refrigerated & Clinical Centrifuges, Biosafety Cabinets Class II, Autoclaves).
3. Analytical Instruments (Real-Time PCR Thermal Cyclers, UV-Vis Spectrophotometers, Chromatography).
4. Molecular Biology & Life Science (DNA/RNA Extraction, Electrophoresis, Gel Documentation).
5. General Research & Scientific Equipment (Laboratory Ovens, Precision Analytical Balances, Incubator Shakers, Microscopes).
6. Consumables & Accessories (Reagents, Lyse Packs, SpO2 & ECG Patient Cables, Vacuum Blood Tubes).
7. Engineering Solutions (Medical Gas Pipeline Systems - MGPS, Modular Cleanrooms, Medical Isolated UPS Power).`;
  }

  // 5. Build Company & Contact Profile
  const companyPhone = cmsData.phone || '+254 142 808755';
  const companyWhatsApp = cmsData.whatsapp || '+254 745 662 988';
  const companyEmail = cmsData.email || 'info@medlabinnovate.co.ke';
  const companyAddress = cmsData.address || 'Nairobi, Kenya';
  const businessHours = cmsData.businessHours || 'Monday – Friday: 8:00 AM – 5:00 PM EAT, Saturday: 9:00 AM – 1:00 PM EAT (24/7 emergency biomedical support for critical care units)';

  // 6. Detect Intent for Action Triggering
  const q = data.message.toLowerCase();
  const isQuoteIntent = q.includes('quote') || q.includes('quotation') || q.includes('rfq') || q.includes('price') || q.includes('pricing') || q.includes('cost') || q.includes('buy') || q.includes('purchase') || q.includes('order');
  const isServiceIntent = q.includes('service') || q.includes('servicing') || q.includes('repair') || q.includes('maintenance') || q.includes('amc') || q.includes('cmc') || q.includes('calibrate') || q.includes('calibration') || q.includes('breakdown') || q.includes('not working') || q.includes('error') || q.includes('fault') || q.includes('fix');

  // 7. Format Multi-Turn Conversation History
  let historySection = '';
  if (data.history && data.history.length > 0) {
    const recent = data.history.slice(-4);
    historySection = `CONVERSATION HISTORY:\n${recent.map((h) => `${h.sender === 'user' ? 'Client' : 'Assistant'}: ${h.content}`).join('\n')}\n\n`;
  }

  // 8. Compile the Master System Prompt
  const masterPrompt = `You are MedBot, the dedicated AI Customer Support & Product Enquiry Assistant for Medlab Innovate Engineering Ltd in Nairobi, Kenya.

ABOUT MEDLAB INNOVATE ENGINEERING LTD:
• Who we are: Kenya and East Africa's premier biomedical engineering firm and healthcare technology provider. We supply hospital medical equipment, laboratory diagnostic systems, and life-science research instrumentation.
• Core Engineering Services:
  1. Healthcare Technology & Medical Equipment Procurement & Supply
  2. Professional Turnkey Installation, Testing & Commissioning
  3. Preventive & Corrective Maintenance (AMC - Annual Maintenance Contracts, CMC - Comprehensive Maintenance Contracts)
  4. Biomedical Equipment Precision Calibration & Electrical Safety Compliance Testing
  5. Medical Gas Pipeline Systems (MGPS) design, installation, certification & repair
  6. Modular Cleanrooms & Laboratory Containment Engineering
  7. Clinical Operator Training & 24/7 Biomedical Emergency Dispatch
• Operating Areas: All 47 counties of Kenya (Nairobi HQ, Mombasa, Kisumu, Eldoret, Nakuru, etc.) and across the wider East Africa region.
• Official Contacts & Operating Hours:
  - Email: ${companyEmail}
  - Official Sales & Engineering Desk: ${companyPhone}
  - WhatsApp & Direct Line: ${companyWhatsApp}
  - Physical Office: ${companyAddress}
  - Business Hours: ${businessHours}

APPROVED PRODUCT DATABASE:
${productContextText}

INTERACTION & ACTION RULES:
1. STRICT TRUTH & APPROVED INFORMATION: Only provide factual specifications and information from the approved database above. NEVER fabricate unapproved pricing, arbitrary discounts, or warranty claims.
2. LEAD CUSTOMERS TO THE RIGHT ACTION:
   • If asking about specific equipment (e.g. ECG machine, ventilator, centrifuge, ultrasound, analyzer): Explain what the equipment is used for, cite the approved models/specs from our database, ask clarifying clinical questions (e.g. number of channels, clinic tier, volume, adult vs pediatric), and encourage requesting an official quotation (RFQ).
   • If asking about "laboratory equipment" generally: Ask what specific laboratory section (Hematology, Clinical Chemistry, Microbiology, Molecular Biology, Histopathology) and testing capacity/throughput.
   • If asking for equipment servicing, repair, maintenance, or calibration: Detail our preventive maintenance capabilities (AMC vs CMC standards) and direct them to submit an Equipment Service Ticket / Enquiry.
   • If asking for a quotation, price, or purchase: Explain that formal quotations with tax invoices and freight/warranty are issued upon request, and invite them to submit their details (Name, Hospital/Facility, Contact, Product) via the RFQ form.
   • If asking for brochures or technical manuals: Confirm official datasheets are available and offer to forward them or have them submit an enquiry.
   • If asking about company identity, contacts, or location: Provide our full contact details, location in Nairobi, and operating hours clearly.
3. HUMAN HANDOVER:
   If an inquiry requires custom tender bids, unlisted specialized models, or on-site biomedical inspection, do NOT guess. State politely that Medlab Innovate's senior biomedical engineering team will handle this enquiry, and provide our direct contact channels (Phone: ${companyPhone}, WhatsApp: ${companyWhatsApp}, Email: ${companyEmail}) or offer the enquiry submission option.
4. TONE: Professional, welcoming, technically authoritative, and structured with clean bullet points.

${historySection}CLIENT ENQUIRY: "${data.message}"

Please respond thoroughly as Medlab Innovate's Customer Support & Product Enquiry Assistant:`;

  // 9. Send to Cloudflare Worker
  let reply = '';
  try {
    const res = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_CHATBOT_API_KEY || 'mle_live_ffa337969b2f8d2ea79363c355baafe32976fd2ebdb98b11ea698cec9bfb497e',
      },
      body: JSON.stringify({ message: masterPrompt, conversationId: data.conversationId }),
    });

    if (res.ok) {
      const json = await res.json();
      reply = json.reply || json.message || json.text || '';
    } else {
      throw new Error(`Worker HTTP ${res.status}`);
    }
  } catch (workerErr) {
    console.warn('[Chatbot Worker] Failed, using fallback:', workerErr);
    reply = `Thank you for contacting **Medlab Innovate Engineering Ltd**.\n\nWe provide certified biomedical equipment, preventive maintenance (AMC/CMC), equipment calibration, and medical gas solutions across Kenya and East Africa.\n\nOur engineering sales desk can be reached directly:\n• **Email**: ${companyEmail}\n• **Phone**: ${companyPhone}\n• **WhatsApp**: ${companyWhatsApp}\n• **Hours**: ${businessHours}\n\nPlease click below to request an official quotation or submit a service ticket.`;
  }

  const cId = data.conversationId || `CONV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  // 10. Record in Firestore chat_conversations for live admin audit & analytics
  try {
    const convRef = doc(db, 'chat_conversations', cId);
    const convSnap = await getDoc(convRef);
    const userMsg = { sender: 'user', text: data.message, timestamp: new Date().toISOString() };
    const botMsg = { sender: 'ai', text: reply, timestamp: new Date().toISOString() };
    const prodNames = matchingProducts.map((p) => p.name);

    if (convSnap.exists()) {
      const existing = convSnap.data() as any;
      const existingMessages = Array.isArray(existing.messages) ? existing.messages : [];
      const existingProducts = Array.isArray(existing.productsDiscussed) ? existing.productsDiscussed : [];

      await updateDoc(convRef, {
        messages: [...existingMessages, userMsg, botMsg],
        lastMessageAt: serverTimestamp(),
        leadStatus: isQuoteIntent ? 'Converted to RFQ' : isServiceIntent ? 'Support Escalated' : (existing.leadStatus || 'Chatting'),
        productsDiscussed: Array.from(new Set([...existingProducts, ...prodNames])),
      });
    } else {
      await setDoc(convRef, {
        conversationId: cId,
        customer: data.customer || { name: 'Website Visitor', organization: 'Healthcare Client' },
        topic: data.message.slice(0, 60),
        productsDiscussed: prodNames,
        leadStatus: isQuoteIntent ? 'Converted to RFQ' : isServiceIntent ? 'Support Escalated' : 'Chatting',
        messages: [userMsg, botMsg],
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });
    }
  } catch (convErr) {
    console.warn('[Firestore] Chat conversation sync skipped:', convErr);
  }

  return {
    success: true,
    reply,
    conversationId: cId,
    suggestedProducts: matchingProducts.length > 0 ? matchingProducts : (allProducts.length > 0 ? allProducts.slice(0, 3) : undefined),
    leadCaptured: isQuoteIntent,
    escalateToTicket: isServiceIntent,
  };
}

async function getConversations(params = ''): Promise<{ success: boolean; data: any[]; pagination: any }> {
  try {
    const snap = await getDocs(query(collection(db, 'chat_conversations'), orderBy('lastMessageAt', 'desc')));
    const docs = snap.docs.map((d) => docToObject(d));
    return { success: true, data: docs, pagination: { page: 1, limit: 50, total: docs.length, totalPages: 1 } };
  } catch {
    return { success: true, data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 1 } };
  }
}

async function convertLeadToEnquiry(conversationId: string): Promise<{ success: boolean; data: any }> {
  const q = query(collection(db, 'chat_conversations'), where('conversationId', '==', conversationId), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Conversation not found');
  const conv = snap.docs[0].data() as any;
  const enquiryId = `MLE-ENQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const docRef = await addDoc(collection(db, 'enquiries'), {
    enquiryId, customerName: conv.customer?.name || 'Inquiry Contact', organization: conv.customer?.organization || 'Clinical Facility',
    phoneNumber: conv.customer?.phone || 'N/A', emailAddress: conv.customer?.email || 'sales@medlabinnovate.co.ke',
    location: conv.customer?.location || 'Regional Territory', equipmentSummary: (conv.productsDiscussed || []).join(', ') || 'AI Chat Consultation',
    quantityTotal: 1, source: 'chatbot', status: 'New', createdAt: serverTimestamp(),
  });
  await updateDoc(snap.docs[0].ref, { leadStatus: 'Converted to Enquiry', enquiryId });
  return { success: true, data: { _id: docRef.id, enquiryId } };
}

// ─────────────────────────────────────────────
// ANALYTICS DASHBOARD
// ─────────────────────────────────────────────
async function getDashboardAnalytics(): Promise<{ success: boolean; data: any }> {
  try {
    const [productsSnap, enquiriesSnap, quotationsSnap, ticketsSnap, customersSnap] = await Promise.all([
      getCountFromServer(collection(db, 'products')),
      getCountFromServer(collection(db, 'enquiries')),
      getCountFromServer(collection(db, 'quotations')),
      getCountFromServer(collection(db, 'support_tickets')),
      getCountFromServer(collection(db, 'customers')),
    ]);
    const [publishedSnap, newEnqSnap, pendingQtSnap, openTickSnap] = await Promise.all([
      getCountFromServer(query(collection(db, 'products'), where('status', '==', 'Published'))),
      getCountFromServer(query(collection(db, 'enquiries'), where('status', '==', 'New'))),
      getCountFromServer(query(collection(db, 'quotations'), where('status', '==', 'Draft'))),
      getCountFromServer(query(collection(db, 'support_tickets'), where('status', 'in', ['New', 'Assigned', 'In Progress']))),
    ]);
    const recentEnqSnap = await getDocs(query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'), limit(5)));
    const recentTickSnap = await getDocs(query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'), limit(5)));
    const pipelineStatuses = ['New', 'Contacted', 'Quotation Sent', 'Follow-up', 'Converted', 'Closed'];
    const pipeline: Record<string, number> = {};
    await Promise.all(pipelineStatuses.map(async (s) => {
      const c = await getCountFromServer(query(collection(db, 'enquiries'), where('status', '==', s)));
      pipeline[s] = c.data().count;
    }));
    return {
      success: true,
      data: {
        kpis: {
          totalProducts: { value: productsSnap.data().count, label: 'Total Products', trend: 'Catalog Items' },
          activeProducts: { value: publishedSnap.data().count, label: 'Active in Catalog', trend: 'Published' },
          newEnquiries: { value: newEnqSnap.data().count, label: 'New Requisitions', trend: `${enquiriesSnap.data().count} total` },
          pendingQuotations: { value: pendingQtSnap.data().count, label: 'Pending Quotations', trend: `${quotationsSnap.data().count} total` },
          openSupportTickets: { value: openTickSnap.data().count, label: 'Open Service Tickets', trend: `${ticketsSnap.data().count} total` },
          activeCustomers: { value: customersSnap.data().count, label: 'Healthcare Clients', trend: 'Registered' },
        },
        salesPipeline: pipeline,
        dailyEnquiries: [],
        recentEnquiries: recentEnqSnap.docs.map((d) => docToObject(d)),
        recentTickets: recentTickSnap.docs.map((d) => docToObject(d)),
      },
    };
  } catch (err: any) {
    console.warn('[Firestore] getDashboardAnalytics error:', err.message);
    return { success: true, data: { kpis: { totalProducts: { value: 0, label: 'Total Products', trend: 'Catalog Items' }, activeProducts: { value: 0, label: 'Active in Catalog', trend: 'Published' }, newEnquiries: { value: 0, label: 'New Requisitions', trend: '0 active' }, pendingQuotations: { value: 0, label: 'Pending Quotations', trend: '0 pending' }, openSupportTickets: { value: 0, label: 'Open Service Tickets', trend: '0 open' }, activeCustomers: { value: 0, label: 'Healthcare Clients', trend: '0 registered' } }, salesPipeline: { New: 0, Contacted: 0, 'Quotation Sent': 0, 'Follow-up': 0, Converted: 0, Closed: 0 }, dailyEnquiries: [], recentEnquiries: [], recentTickets: [] } };
  }
}

// ─────────────────────────────────────────────
// CMS
// ─────────────────────────────────────────────
async function getCMS(): Promise<{ success: boolean; data: Record<string, any> }> {
  try {
    const snap = await getDoc(doc(db, 'cms', 'site_config'));
    return { success: true, data: snap.exists() ? snap.data() : {} };
  } catch {
    return { success: true, data: {} };
  }
}

async function updateCMS(section: string, data: any): Promise<{ success: boolean; data: any }> {
  await setDoc(doc(db, 'cms', 'site_config'), { [section]: data, updatedAt: serverTimestamp() }, { merge: true });
  return { success: true, data };
}

async function getSiteSettings(): Promise<{ success: boolean; data: Record<string, any> }> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'site'));
    return { success: true, data: snap.exists() ? snap.data() : {} };
  } catch {
    return { success: true, data: {} };
  }
}

async function updateSiteSettings(data: Record<string, any>): Promise<{ success: boolean; data: Record<string, any> }> {
  await setDoc(doc(db, 'settings', 'site'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return { success: true, data };
}

// ─────────────────────────────────────────────
// AUTH stub — actual login done via Firebase Auth in login page
// ─────────────────────────────────────────────
async function login(_data: any): Promise<{ success: boolean; data: { accessToken: string; user: IUser } }> {
  throw new Error('Use Firebase Auth directly for login');
}

// ─────────────────────────────────────────────
// USERS / NOTIFICATIONS / LOGS / KB
// ─────────────────────────────────────────────
async function getUsers(): Promise<{ success: boolean; data: IUser[] }> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return { success: true, data: snap.docs.map((d) => docToObject<IUser>(d)) };
  } catch { return { success: true, data: [] }; }
}

async function createUser(data: Partial<IUser> & { password: string }): Promise<{ success: boolean; data: IUser }> {
  if (!data.name?.trim() || !data.email?.trim() || !data.password?.trim() || !data.role) {
    throw new Error('Name, email, password, and role are required.');
  }
  if (data.role === 'Super Admin') {
    const existing = await getDocs(query(collection(db, 'users'), where('role', '==', 'Super Admin'), limit(1)));
    if (!existing.empty) throw new Error('Only one Super Admin account is allowed.');
  }
  const email = data.email.trim().toLowerCase();
  const duplicate = await getDocs(query(collection(db, 'users'), where('email', '==', email), limit(1)));
  if (!duplicate.empty) throw new Error('An account with this email already exists.');
  const docRef = await addDoc(collection(db, 'users'), {
    ...data,
    name: data.name.trim(),
    email,
    status: data.status || 'Active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { success: true, data: { ...data, id: docRef.id, _id: docRef.id, email } as IUser };
}

async function updateUser(id: string, data: Partial<IUser> & { password?: string }): Promise<{ success: boolean; data: IUser }> {
  if (!id) throw new Error('User ID is required.');
  if (data.role === 'Super Admin') {
    const existing = await getDocs(query(collection(db, 'users'), where('role', '==', 'Super Admin')));
    if (existing.docs.some((item) => item.id !== id)) throw new Error('Only one Super Admin account is allowed.');
  }
  const updateData = { ...data, ...(data.email ? { email: data.email.trim().toLowerCase() } : {}), updatedAt: serverTimestamp() };
  if (!updateData.password) delete (updateData as Partial<typeof updateData>).password;
  await updateDoc(doc(db, 'users', id), updateData);
  return { success: true, data: { ...data, id, _id: id } as IUser };
}

async function deleteUser(id: string): Promise<{ success: boolean }> {
  if (!id) throw new Error('User ID is required.');
  const userSnap = await getDoc(doc(db, 'users', id));
  if (userSnap.exists() && userSnap.data().role === 'Super Admin') {
    throw new Error('The Super Admin account cannot be deleted.');
  }
  await deleteDoc(doc(db, 'users', id));
  return { success: true };
}

async function getNotifications(): Promise<{ success: boolean; data: any[]; unreadCount: number }> {
  try {
    const snap = await getDocs(query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20)));
    const data = snap.docs.map((d) => docToObject(d));
    return { success: true, data, unreadCount: data.filter((n: any) => !n.isRead).length };
  } catch { return { success: true, data: [], unreadCount: 0 }; }
}

async function getActivityLogs(): Promise<{ success: boolean; data: any[]; message?: string }> {
  try {
    // Sort after reading so older records without createdAt are not silently
    // excluded by an orderBy query.
    const snap = await getDocs(collection(db, 'activity_logs'));
    const data = snap.docs.map((d) => docToObject<any>(d));
    const getTime = (value: any): number => {
      if (!value) return 0;
      if (typeof value.toDate === 'function') return value.toDate().getTime();
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    data.sort((a, b) => getTime(b.createdAt || b.timestamp) - getTime(a.createdAt || a.timestamp));
    return { success: true, data: data.slice(0, 50) };
  } catch (err: any) {
    console.error('[Firestore] getActivityLogs error:', err);
    return { success: false, data: [], message: err?.message || 'Unable to load activity logs.' };
  }
}

async function getKnowledgeBase(): Promise<{ success: boolean; data: any[] }> {
  try {
    const snap = await getDocs(collection(db, 'knowledge_base'));
    return { success: true, data: snap.docs.map((d) => docToObject(d)) };
  } catch { return { success: true, data: [] }; }
}

async function createKnowledgeArticle(data: { category: string; title: string; content: string; isPublished: boolean }): Promise<{ success: boolean; data: any }> {
  const docRef = await addDoc(collection(db, 'knowledge_base'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { success: true, data: { ...data, id: docRef.id, _id: docRef.id } };
}

async function updateKnowledgeArticle(id: string, data: Partial<{ category: string; title: string; content: string; isPublished: boolean }>): Promise<{ success: boolean }> {
  await updateDoc(doc(db, 'knowledge_base', id), { ...data, updatedAt: serverTimestamp() });
  return { success: true };
}

async function deleteKnowledgeArticle(id: string): Promise<{ success: boolean }> {
  await deleteDoc(doc(db, 'knowledge_base', id));
  return { success: true };
}

// ─────────────────────────────────────────────
// MEDIA ASSETS PERSISTENCE
// ─────────────────────────────────────────────
async function getMediaAssets(): Promise<{ success: boolean; data: any[] }> {
  try {
    const snap = await getDocs(collection(db, 'media'));
    const items = snap.docs.map((d) => docToObject<any>(d));
    items.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
    return { success: true, data: items };
  } catch {
    return { success: true, data: [] };
  }
}

async function syncCatalogMedia(): Promise<{ success: boolean; count: number; data: any[] }> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    const existingSnap = await getDocs(collection(db, 'media'));
    const existingUrls = new Set(existingSnap.docs.map((d) => d.data().url));
    const newItems: any[] = [];

    snap.forEach((d) => {
      const p = d.data();
      const prodName = p.name || 'Equipment';

      if (Array.isArray(p.images)) {
        p.images.forEach((img: any, idx: number) => {
          const url = typeof img === 'string' ? img : img?.url || '';
          if (url && !existingUrls.has(url)) {
            existingUrls.add(url);
            newItems.push({
              title: `${prodName} (Image ${idx + 1})`,
              url,
              type: 'image',
              size: '1.20 MB',
              category: p.category || 'Equipment Catalog',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString().split('T')[0],
            });
          }
        });
      }

      if (p.primaryImage && typeof p.primaryImage === 'string' && !existingUrls.has(p.primaryImage)) {
        existingUrls.add(p.primaryImage);
        newItems.push({
          title: `${prodName} (Primary Photo)`,
          url: p.primaryImage,
          type: 'image',
          size: '1.40 MB',
          category: p.category || 'Equipment Catalog',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString().split('T')[0],
        });
      }

      if (Array.isArray(p.documents)) {
        p.documents.forEach((docItem: any) => {
          const url = docItem?.url || '';
          if (url && !existingUrls.has(url)) {
            existingUrls.add(url);
            newItems.push({
              title: `${prodName} - ${docItem.title || 'Technical Datasheet'}`,
              url,
              type: 'pdf',
              size: docItem.size || '2.50 MB',
              category: p.category || 'Technical Documentation',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString().split('T')[0],
            });
          }
        });
      }
    });

    for (const item of newItems) {
      await addDoc(collection(db, 'media'), item);
    }

    const allMedia = await getMediaAssets();
    return { success: true, count: newItems.length, data: allMedia.data };
  } catch {
    return { success: false, count: 0, data: [] };
  }
}

async function createMediaAsset(asset: { title: string; url: string; type: string; size?: string }): Promise<{ success: boolean; data: any }> {
  const docRef = await addDoc(collection(db, 'media'), {
    ...asset,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return { success: true, data: { ...asset, id: docRef.id, _id: docRef.id } };
}

async function deleteMediaAsset(id: string): Promise<{ success: boolean }> {
  await deleteDoc(doc(db, 'media', id));
  return { success: true };
}

// ─────────────────────────────────────────────
// DATABASE & COLLECTIONS DIRECT MANAGEMENT
// ─────────────────────────────────────────────
async function getDatabaseOverview(): Promise<{ success: boolean; collections: Array<{ name: string; label: string; count: number; description: string; icon: string }> }> {
  const collectionList = [
    { name: 'products', label: 'Products & Equipment', description: 'Medical equipment, specifications, manuals and brochures', icon: 'Boxes' },
    { name: 'categories', label: 'Categories & Subcategories', description: 'Equipment classification hierarchy', icon: 'Layers' },
    { name: 'enquiries', label: 'Enquiries & RFQ Messages', description: 'Customer messages, requisitions and quotations requests', icon: 'FileSpreadsheet' },
    { name: 'quotations', label: 'Quotations', description: 'Generated commercial price quotes and formal tenders', icon: 'FileCheck' },
    { name: 'support_tickets', label: 'Support Tickets', description: 'Biomedical maintenance, calibration and repairs', icon: 'Headphones' },
    { name: 'users', label: 'Users & Admins', description: 'Authorized personnel accounts and RBAC roles', icon: 'Users' },
    { name: 'chat_conversations', label: 'Chatbot Conversations', description: 'Logged AI Assistant conversations with clients', icon: 'Bot' },
    { name: 'knowledge_base', label: 'Knowledge Base', description: 'Grounding articles & technical FAQ for AI Assistant', icon: 'BrainCircuit' },
    { name: 'activity_logs', label: 'Activity Logs', description: 'System audit trails and admin actions', icon: 'Clock' },
    { name: 'media', label: 'Media Library', description: 'Equipment images, brochures, manuals, and documents', icon: 'FolderOpen' },
  ];

  try {
    const results = await Promise.all(
      collectionList.map(async (col) => {
        try {
          const snap = await getDocs(collection(db, col.name));
          return { ...col, count: snap.size };
        } catch {
          return { ...col, count: 0 };
        }
      })
    );
    return { success: true, collections: results };
  } catch {
    return { success: false, collections: collectionList.map((c) => ({ ...c, count: 0 })) };
  }
}

async function getCollectionDocs(collectionName: string, maxLimit = 150): Promise<{ success: boolean; data: any[] }> {
  try {
    const targetCol = collectionName === 'conversations' ? 'chat_conversations' : collectionName;
    const snap = await getDocs(query(collection(db, targetCol), limit(maxLimit)));
    const docs = snap.docs.map((d) => ({
      ...docToObject<any>(d),
      _rawId: d.id,
    }));
    return { success: true, data: docs };
  } catch (err: any) {
    return { success: false, data: [] };
  }
}

async function saveCollectionDoc(collectionName: string, docId: string, data: any): Promise<{ success: boolean; docId: string }> {
  const targetCol = collectionName === 'conversations' ? 'chat_conversations' : collectionName;
  const cleanData = { ...data };
  delete cleanData._id;
  delete cleanData.id;
  delete cleanData._rawId;
  cleanData.updatedAt = new Date().toISOString();

  if (docId && docId.trim()) {
    await setDoc(doc(db, targetCol, docId.trim()), cleanData, { merge: true });
    return { success: true, docId: docId.trim() };
  } else {
    const ref = await addDoc(collection(db, targetCol), {
      ...cleanData,
      createdAt: new Date().toISOString(),
    });
    return { success: true, docId: ref.id };
  }
}

async function deleteCollectionDoc(collectionName: string, docId: string): Promise<{ success: boolean }> {
  const targetCol = collectionName === 'conversations' ? 'chat_conversations' : collectionName;
  await deleteDoc(doc(db, targetCol, docId));
  return { success: true };
}

// ─────────────────────────────────────────────
// UNIFIED API EXPORT (drop-in replacement)
// ─────────────────────────────────────────────
export const api = {
  getProducts, getProductById, getProductBySlug, createProduct, updateProduct, deleteProduct, duplicateProduct,
  getCategories, createCategory, deleteCategory, getBrands,
  getEnquiries, getEnquiryById, createEnquiry, updateEnquiry,
  getQuotations, getQuotationById, createQuotation, updateQuotation, deleteQuotation, sendQuotationEmail, duplicateQuotation,
  getCustomers, getCustomerById,
  getSupportTickets, getTicketById, createTicket, updateTicket,
  sendChatMessage, getConversations, convertLeadToEnquiry,
  getDashboardAnalytics,
  getCMS, updateCMS,
  getSiteSettings, updateSiteSettings,
  login,
  getUsers, createUser, updateUser, deleteUser, getNotifications, getActivityLogs, getKnowledgeBase,
  createKnowledgeArticle, updateKnowledgeArticle, deleteKnowledgeArticle,
  getMediaAssets, createMediaAsset, deleteMediaAsset, syncCatalogMedia,
  getDatabaseOverview, getCollectionDocs, saveCollectionDoc, deleteCollectionDoc,
};

