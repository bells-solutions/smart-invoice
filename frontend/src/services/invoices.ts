import api from './api';
import type { Invoice, DashboardStats } from '@/types';

export const invoiceService = {
  async getAll() {
    const response = await api.get<Invoice[]>('/invoices');
    return response.data;
  },

  async getOne(id: string) {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  async create(data: Partial<Invoice>) {
    const response = await api.post<Invoice>('/invoices', data);
    return response.data;
  },

  async update(id: string, data: Partial<Invoice>) {
    const response = await api.put<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/invoices/${id}`);
  },

  async getDashboardStats() {
    const response = await api.get<DashboardStats>('/invoices/dashboard/stats');
    return response.data;
  },

  async downloadPDF(id: string) {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
