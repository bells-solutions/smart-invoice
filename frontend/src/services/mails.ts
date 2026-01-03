import api from "@/services/api";

export const mailService = {
  async sendInvoiceEmail(invoiceId: string) {
    const response = await api.post(`/invoices/${invoiceId}/send-email`);
    return response.data;
  },

  async sendPaymentReminder(invoiceId: string) {
    const response = await api.post(`/invoices/${invoiceId}/send-reminder`);
    return response.data;
  },
};
