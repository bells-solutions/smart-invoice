export interface User {
  id: string;
  email: string;
  accountType: "individual" | "company";
  firstName?: string;
  lastName?: string;
  phone?: string;
  town?: string;
  address?: string;
  companyName?: string;
  taxpayerNumber?: string;
  commercialRegister?: string;
  poBox?: string;
  companyLogo?: string;
  profilePicture?: string;
  currency?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  clientType: "individual" | "company";
  companyName?: string;
  taxpayerNumber?: string;
  commercialRegister?: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid",
  OVERDUE = "overdue",
}

export enum InvoiceType {
  NORMAL = "normal",
  PROFORMA = "proforma",
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tvaEnabled: boolean;
  tvaRate: number;
  tvaAmount: number;
  irEnabled: boolean;
  irRate: number;
  irAmount: number;
  discountEnabled: boolean;
  discountRate: number;
  discountAmount: number;
  total: number;
  notes?: string;
  clientId: string;
  client?: Client;
  items: InvoiceItem[];
}

export interface DashboardStats {
  totalInvoices: number;
  totalSales: number;
  unpaidInvoices: number;
  unpaidAmount: number;
  paidInvoices: number;
}
