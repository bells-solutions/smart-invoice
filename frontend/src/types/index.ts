export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
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

export interface Invoice {
  id: string;
  invoiceNumber: string;
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
