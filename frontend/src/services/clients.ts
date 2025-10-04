import api from './api';
import type { Client } from '@/types';

export const clientService = {
  async getAll() {
    const response = await api.get<Client[]>('/clients');
    return response.data;
  },

  async getOne(id: string) {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  async create(data: Partial<Client>) {
    const response = await api.post<Client>('/clients', data);
    return response.data;
  },

  async update(id: string, data: Partial<Client>) {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`/clients/${id}`);
  },
};
