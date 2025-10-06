import api from "./api";
import type { Invoice, DashboardStats } from "@/types";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function normalizeInvoice(inv: Invoice): Invoice {
  const out: any = { ...inv };

  if ((inv as any).subtotal !== undefined) {
    out.subtotal = toNumber((inv as any).subtotal);
  }
  if ((inv as any).tvaRate !== undefined) {
    out.tvaRate = toNumber((inv as any).tvaRate);
  }
  if ((inv as any).tvaAmount !== undefined) {
    out.tvaAmount = toNumber((inv as any).tvaAmount);
  }
  if ((inv as any).irRate !== undefined) {
    out.irRate = toNumber((inv as any).irRate);
  }
  if ((inv as any).irAmount !== undefined) {
    out.irAmount = toNumber((inv as any).irAmount);
  }
  if ((inv as any).total !== undefined) {
    out.total = toNumber((inv as any).total);
  }
  if ((inv as any).items !== undefined) {
    out.items = (inv.items || []).map((it) => ({
      ...it,
      ...(it.unitPrice !== undefined
        ? { unitPrice: toNumber((it as any).unitPrice) }
        : {}),
      ...(it.amount !== undefined
        ? { amount: toNumber((it as any).amount) }
        : {}),
    }));
  }

  return out as Invoice;
}

export const invoiceService = {
  async getAll() {
    const response = await api.get<Invoice[]>("/invoices");
    return response.data.map(normalizeInvoice);
  },

  async getOne(id: string) {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return normalizeInvoice(response.data);
  },

  async create(data: Partial<Invoice>) {
    const response = await api.post<Invoice>("/invoices", data);
    return normalizeInvoice(response.data);
  },

  async update(id: string, data: Partial<Invoice>) {
    const response = await api.put<Invoice>(`/invoices/${id}`, data);
    return normalizeInvoice(response.data);
  },

  async delete(id: string) {
    await api.delete(`/invoices/${id}`);
  },

  async getDashboardStats() {
    const response = await api.get<DashboardStats>("/invoices/dashboard/stats");
    return response.data;
  },

  async downloadPDF(id: string) {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
