import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoiceService } from './invoices';
import api from './api';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Invoice Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all invoices', async () => {
      const mockInvoices = [
        {
          id: '1',
          invoiceNumber: 'INV-000001',
          status: 'draft',
          total: 100,
        },
        {
          id: '2',
          invoiceNumber: 'INV-000002',
          status: 'sent',
          total: 200,
        },
      ];

      vi.mocked(api.get).mockResolvedValue({ data: mockInvoices });

      const result = await invoiceService.getAll();

      expect(api.get).toHaveBeenCalledWith('/invoices');
      expect(result).toEqual(mockInvoices);
    });
  });

  describe('getOne', () => {
    it('should fetch a single invoice', async () => {
      const mockInvoice = {
        id: '1',
        invoiceNumber: 'INV-000001',
        status: 'draft',
        total: 100,
        items: [],
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockInvoice });

      const result = await invoiceService.getOne('1');

      expect(api.get).toHaveBeenCalledWith('/invoices/1');
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('create', () => {
    it('should create a new invoice', async () => {
      const newInvoice = {
        clientId: 'client-1',
        issueDate: '2024-01-01',
        dueDate: '2024-02-01',
        taxRate: 10,
        items: [
          {
            description: 'Item 1',
            quantity: 2,
            unitPrice: 50,
          },
        ],
      };

      const mockResponse = {
        id: '1',
        invoiceNumber: 'INV-000001',
        ...newInvoice,
        subtotal: 100,
        taxAmount: 10,
        total: 110,
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await invoiceService.create(newInvoice);

      expect(api.post).toHaveBeenCalledWith('/invoices', newInvoice);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing invoice', async () => {
      const updateData = {
        status: 'sent' as any,
      };

      const mockResponse = {
        id: '1',
        invoiceNumber: 'INV-000001',
        status: 'sent',
        total: 100,
      };

      vi.mocked(api.put).mockResolvedValue({ data: mockResponse });

      const result = await invoiceService.update('1', updateData);

      expect(api.put).toHaveBeenCalledWith('/invoices/1', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete an invoice', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: {} });

      await invoiceService.delete('1');

      expect(api.delete).toHaveBeenCalledWith('/invoices/1');
    });
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard statistics', async () => {
      const mockStats = {
        totalInvoices: 10,
        totalSales: 5000,
        unpaidInvoices: 3,
        unpaidAmount: 1500,
        paidInvoices: 7,
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockStats });

      const result = await invoiceService.getDashboardStats();

      expect(api.get).toHaveBeenCalledWith('/invoices/dashboard/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('downloadPDF', () => {
    it('should download invoice as PDF', async () => {
      const mockBlob = new Blob(['test pdf'], { type: 'application/pdf' });
      
      vi.mocked(api.get).mockResolvedValue({ data: mockBlob });
      
      // Mock window.URL.createObjectURL and document methods
      global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
      const mockLink = {
        href: '',
        setAttribute: vi.fn(),
        click: vi.fn(),
        remove: vi.fn(),
      };
      document.createElement = vi.fn(() => mockLink as any);
      document.body.appendChild = vi.fn();

      await invoiceService.downloadPDF('1');

      expect(api.get).toHaveBeenCalledWith('/invoices/1/pdf', {
        responseType: 'blob',
      });
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
    });
  });
});
