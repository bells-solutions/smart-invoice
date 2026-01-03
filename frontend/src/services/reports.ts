import api from "./api";

export const reportsService = {
  async getDashboardStats() {
    const response = await api.get("/invoices/dashboard-stats");
    return response.data;
  },

  async getMonthlySummary() {
    const response = await api.get("/invoices/monthly-summary");
    return response.data;
  },

  async generateMonthlySummary() {
    const response = await api.post("/invoices/generate-monthly-summary");
    return response.data;
  },

  async getOverdueInvoices() {
    const response = await api.get("/invoices/overdue");
    return response.data;
  },

  async sendPaymentReminder(invoiceId: string) {
    const response = await api.post(`/invoices/${invoiceId}/send-reminder`);
    return response.data;
  },
};
