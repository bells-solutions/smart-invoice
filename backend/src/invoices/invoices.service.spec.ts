import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceStatus } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { User } from '../users/user.entity';
import { CreateInvoiceDto } from './invoice.dto';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let invoiceRepository: Repository<Invoice>;
  let invoiceItemRepository: Repository<InvoiceItem>;

  const mockInvoiceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  const mockInvoiceItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed',
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'Test Company',
    companyLogo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    clients: [],
    invoices: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
        {
          provide: getRepositoryToken(InvoiceItem),
          useValue: mockInvoiceItemRepository,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    invoiceRepository = module.get<Repository<Invoice>>(
      getRepositoryToken(Invoice),
    );
    invoiceItemRepository = module.get<Repository<InvoiceItem>>(
      getRepositoryToken(InvoiceItem),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new invoice with items', async () => {
      const createInvoiceDto: CreateInvoiceDto = {
        clientId: 'client-1',
        issueDate: '2024-01-01',
        dueDate: '2024-02-01',
        taxRate: 10,
        notes: 'Test notes',
        items: [
          {
            description: 'Item 1',
            quantity: 2,
            unitPrice: 50,
          },
          {
            description: 'Item 2',
            quantity: 1,
            unitPrice: 100,
          },
        ],
      };

      const invoice = {
        id: 'invoice-1',
        invoiceNumber: 'INV-000001',
        clientId: createInvoiceDto.clientId,
        userId: mockUser.id,
        status: InvoiceStatus.DRAFT,
        issueDate: new Date(createInvoiceDto.issueDate),
        dueDate: new Date(createInvoiceDto.dueDate),
        taxRate: createInvoiceDto.taxRate,
        subtotal: 200,
        taxAmount: 20,
        total: 220,
        notes: createInvoiceDto.notes,
      };

      mockInvoiceRepository.count.mockResolvedValue(0);
      mockInvoiceRepository.create.mockReturnValue(invoice);
      mockInvoiceRepository.save.mockResolvedValue(invoice);
      mockInvoiceItemRepository.create.mockImplementation((item) => item);
      mockInvoiceItemRepository.save.mockResolvedValue([]);
      mockInvoiceRepository.findOne.mockResolvedValue({
        ...invoice,
        items: createInvoiceDto.items,
        client: { name: 'Test Client' },
        user: mockUser,
      });

      const result = await service.create(createInvoiceDto, mockUser);

      expect(result.invoiceNumber).toBe('INV-000001');
      expect(mockInvoiceRepository.create).toHaveBeenCalled();
      expect(mockInvoiceItemRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all invoices for a user', async () => {
      const invoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-000001',
          userId: mockUser.id,
          status: InvoiceStatus.DRAFT,
          total: 220,
        },
        {
          id: 'invoice-2',
          invoiceNumber: 'INV-000002',
          userId: mockUser.id,
          status: InvoiceStatus.SENT,
          total: 150,
        },
      ];

      mockInvoiceRepository.find.mockResolvedValue(invoices);

      const result = await service.findAll(mockUser);

      expect(result).toEqual(invoices);
      expect(mockInvoiceRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        relations: ['client', 'items'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an invoice by ID', async () => {
      const invoice = {
        id: 'invoice-1',
        invoiceNumber: 'INV-000001',
        userId: mockUser.id,
        status: InvoiceStatus.DRAFT,
        total: 220,
        items: [],
        client: { name: 'Test Client' },
        user: mockUser,
      };

      mockInvoiceRepository.findOne.mockResolvedValue(invoice);

      const result = await service.findOne('invoice-1', mockUser);

      expect(result).toEqual(invoice);
      expect(mockInvoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invoice-1', userId: mockUser.id },
        relations: ['client', 'items', 'user'],
      });
    });

    it('should throw NotFoundException if invoice not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const invoices = [
        {
          id: 'invoice-1',
          status: InvoiceStatus.PAID,
          total: 100,
        },
        {
          id: 'invoice-2',
          status: InvoiceStatus.SENT,
          total: 150,
        },
        {
          id: 'invoice-3',
          status: InvoiceStatus.PAID,
          total: 200,
        },
      ];

      mockInvoiceRepository.find.mockResolvedValue(invoices);

      const result = await service.getDashboardStats(mockUser);

      expect(result.totalInvoices).toBe(3);
      expect(result.totalSales).toBe(450);
      expect(result.unpaidInvoices).toBe(1);
      expect(result.unpaidAmount).toBe(150);
      expect(result.paidInvoices).toBe(2);
    });
  });

  describe('remove', () => {
    it('should remove an invoice', async () => {
      const invoice = {
        id: 'invoice-1',
        invoiceNumber: 'INV-000001',
        userId: mockUser.id,
      };

      mockInvoiceRepository.findOne.mockResolvedValue(invoice);
      mockInvoiceRepository.remove.mockResolvedValue(invoice);

      const result = await service.remove('invoice-1', mockUser);

      expect(result).toEqual({ deleted: true });
      expect(mockInvoiceRepository.remove).toHaveBeenCalledWith(invoice);
    });
  });

  describe('update', () => {
    it('should update an invoice with items', async () => {
      const existingInvoice = {
        id: 'invoice-1',
        invoiceNumber: 'INV-000001',
        userId: mockUser.id,
        clientId: 'client-1',
        status: InvoiceStatus.DRAFT,
        issueDate: new Date('2024-01-01'),
        dueDate: new Date('2024-02-01'),
        taxRate: 10,
        subtotal: 200,
        taxAmount: 20,
        total: 220,
        notes: 'Old notes',
        items: [
          {
            id: 'item-1',
            description: 'Old Item',
            quantity: 2,
            unitPrice: 100,
            amount: 200,
            invoiceId: 'invoice-1',
          },
        ],
      };

      const updateDto = {
        status: InvoiceStatus.SENT,
        notes: 'New notes',
        items: [
          {
            description: 'New Item',
            quantity: 1,
            unitPrice: 150,
          },
        ],
      };

      mockInvoiceRepository.findOne.mockResolvedValue(existingInvoice);
      mockInvoiceItemRepository.delete.mockResolvedValue({ affected: 1 });
      mockInvoiceItemRepository.create.mockImplementation((item) => item);
      mockInvoiceItemRepository.save.mockResolvedValue([]);
      mockInvoiceRepository.save.mockResolvedValue({
        ...existingInvoice,
        ...updateDto,
        subtotal: 150,
        taxAmount: 15,
        total: 165,
      });

      const result = await service.update('invoice-1', updateDto, mockUser);

      expect(mockInvoiceItemRepository.delete).toHaveBeenCalledWith({
        invoiceId: 'invoice-1',
      });
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
      expect(mockInvoiceRepository.findOne).toHaveBeenCalledTimes(2);
    });
  });
});
