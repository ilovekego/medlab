// Medlab Innovate Engineering Ltd - Shared Frontend Types

export interface ISpecification {
  parameter: string;
  value: string;
  unit?: string;
}

export interface IProductDocument {
  title: string;
  type: 'Brochure' | 'Manual' | 'Certificate' | 'Datasheet' | string;
  url: string;
  size?: string;
}

export interface IProduct {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  sku: string;
  model: string;
  category: string;
  subcategory?: string;
  brand: string;
  shortDescription: string;
  description: string;
  features: string[];
  applications: string[];
  specifications: ISpecification[];
  configurations?: Array<{ name: string; description: string; priceDelta?: number }>;
  images: Array<{ url: string; isPrimary: boolean; alt?: string }>;
  documents: IProductDocument[];
  warranty: string;
  installationRequirements: string;
  trainingRequirements: string;
  priceEstimate?: string;
  leadTime?: string;
  featured: boolean;
  status: 'Draft' | 'Published' | 'Archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: string[];
  order: number;
}

export interface IBrand {
  _id?: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  isPartner?: boolean;
  description?: string;
  website?: string;
}

export interface IEnquiry {
  _id: string;
  enquiryId: string;
  customerName: string;
  organization: string;
  phoneNumber: string;
  phone?: string;
  emailAddress: string;
  email?: string;
  location: string;
  items?: Array<{ productName: string; model?: string; quantity: number; specifications?: string; specs?: string }>;
  quantityTotal: number;
  equipmentSummary: string;
  requiredSpecifications?: string;
  installationRequired: boolean;
  trainingRequired: boolean;
  additionalRequirements?: string;
  source?: 'website' | 'chatbot' | string;
  assignedSalesperson?: { _id: string; name: string; email: string };
  assignedTo?: string;
  isPinned?: boolean;
  status: 'New' | 'Contacted' | 'Quotation Sent' | 'Follow-up' | 'Converted' | 'Closed';
  timeline?: Array<{ event?: string; description?: string; status?: string; note?: string; performedBy?: string; timestamp: string }>;
  notes?: Array<{ note: string; author: string; createdAt: string }>;
  createdAt: string;
}

export interface IQuotation {
  _id: string;
  quoteNumber: string;
  enquiryId?: string;
  customerName?: string;
  customerEmail?: string;
  organization?: string;
  customer: {
    name: string;
    organization: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    name: string;
    productName?: string;
    model: string;
    quantity: number;
    unitPrice: number;
    discountPercentage: number;
    total: number;
  }>;
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  taxRatePercentage: number;
  installationCharges: number;
  trainingCharges: number;
  shippingCharges: number;
  grandTotal: number;
  currency: string;
  validUntil: string;
  termsAndConditions?: string[];
  status: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired';
  sentAt?: string;
  createdAt: string;
}

export interface ISupportTicket {
  _id: string;
  ticketId: string;
  customer: {
    name: string;
    organization: string;
    email: string;
    phone: string;
    location: string;
  };
  equipment: string;
  model: string;
  serialNumber?: string;
  errorCode?: string;
  problem: string;
  description: string;
  assignedTechnician?: { _id: string; name: string; email: string };
  technician?: string;
  technicianName?: string;
  internalNotes?: Array<{ text: string; technicianName?: string; createdAt?: string | Date }>;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'Assigned' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed';
  resolutionNotes?: string;
  createdAt: string;
}

export interface ICustomer {
  _id: string;
  name: string;
  organization: string;
  customerType: string;
  phone: string;
  email: string;
  location: string;
  address?: string;
  totalEnquiries: number;
  totalQuotations: number;
  supportTickets: number;
  lastActivity: string;
}

export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin';
  phone?: string;
  status: 'Active' | 'Inactive';
  permissions?: string[];
  createdAt?: string;
}
