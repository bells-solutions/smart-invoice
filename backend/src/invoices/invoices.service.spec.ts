import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { InvoicesService } from "./invoices.service";
import { Invoice, InvoiceStatus, InvoiceType } from "./invoice.entity";
import { InvoiceItem } from "./invoice-item.entity";
import { User } from "../users/user.entity";
import { CreateInvoiceDto } from "./invoice.dto";

describe("InvoicesService", () => {
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
    id: "user-1",
    email: "test@example.com",
    password: "hashed",
    accountType: "individual",
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    town: "Test City",
    address: "123 Test St",
    companyName: "Test Company",
    taxpayerNumber: "123456789",
    commercialRegister: "RC123456",
    poBox: "12345",
    companyLogo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    clients: [],
    invoices: [],
    profilePicture: "",
    currency: "XAF",
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
      getRepositoryToken(Invoice)
    );
    invoiceItemRepository = module.get<Repository<InvoiceItem>>(
      getRepositoryToken(InvoiceItem)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new invoice with items", async () => {
      const createInvoiceDto: CreateInvoiceDto = {
        clientId: "client-1",
        issueDate: "2024-01-01",
        dueDate: "2024-02-01",
        tvaEnabled: true,
        tvaRate: 19.25,
        irEnabled: false,
        irRate: 5.5,
        notes: "Test notes",
        items: [
          {
            description: "Item 1",
            quantity: 2,
            unitPrice: 50,
          },
          {
            description: "Item 2",
            quantity: 1,
            unitPrice: 100,
          },
        ],
      };

      const invoice = {
        id: "invoice-1",
        invoiceNumber: "INV-000001",
        clientId: createInvoiceDto.clientId,
        userId: mockUser.id,
        status: InvoiceStatus.DRAFT,
        issueDate: new Date(createInvoiceDto.issueDate),
        dueDate: new Date(createInvoiceDto.dueDate),
        tvaEnabled: createInvoiceDto.tvaEnabled,
        tvaRate: createInvoiceDto.tvaRate,
        tvaAmount: 38.5,
        irEnabled: createInvoiceDto.irEnabled,
        irRate: createInvoiceDto.irRate,
        irAmount: 0,
        subtotal: 200,
        total: 238.5,
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
        client: { name: "Test Client" },
        user: mockUser,
      });

      const result = await service.create(createInvoiceDto, mockUser);

      expect(result.invoiceNumber).toBe("INV-000001");
      expect(mockInvoiceRepository.create).toHaveBeenCalled();
      expect(mockInvoiceItemRepository.save).toHaveBeenCalled();
    });

    it("should create a proforma invoice with PRO- prefix", async () => {
      const createInvoiceDto: CreateInvoiceDto = {
        clientId: "client-1",
        issueDate: "2024-01-01",
        dueDate: "2024-02-01",
        type: InvoiceType.PROFORMA,
        items: [
          {
            description: "Item 1",
            quantity: 2,
            unitPrice: 50,
          },
        ],
      };

      const savedInvoice = {
        id: "invoice-1",
        invoiceNumber: "PRO-000001",
        userId: mockUser.id,
        clientId: "client-1",
        issueDate: new Date("2024-01-01"),
        dueDate: new Date("2024-02-01"),
        type: InvoiceType.PROFORMA,
        status: InvoiceStatus.DRAFT,
        subtotal: 100,
        tvaEnabled: false,
        tvaRate: 19.25,
        tvaAmount: 0,
        irEnabled: false,
        irRate: 5.5,
        irAmount: 0,
        total: 100,
        notes: undefined,
        items: [],
        client: { name: "Test Client" },
        user: mockUser,
      };

      mockInvoiceRepository.count.mockResolvedValue(0);
      mockInvoiceRepository.create.mockReturnValue(savedInvoice);
      mockInvoiceRepository.save.mockResolvedValue(savedInvoice);
      mockInvoiceItemRepository.create.mockReturnValue({});
      mockInvoiceItemRepository.save.mockResolvedValue([]);
      mockInvoiceRepository.findOne.mockResolvedValue(savedInvoice);

      const result = await service.create(createInvoiceDto, mockUser);

      expect(result.invoiceNumber).toBe("PRO-000001");
      expect(result.type).toBe(InvoiceType.PROFORMA);
    });
  });

  describe("findAll", () => {
    it("should return all invoices for a user", async () => {
      const invoices = [
        {
          id: "invoice-1",
          invoiceNumber: "INV-000001",
          userId: mockUser.id,
          status: InvoiceStatus.DRAFT,
          total: 220,
        },
        {
          id: "invoice-2",
          invoiceNumber: "INV-000002",
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
        relations: ["client", "items"],
        order: { createdAt: "DESC" },
      });
    });
  });

  describe("findOne", () => {
    it("should return an invoice by ID", async () => {
      const invoice = {
        id: "invoice-1",
        invoiceNumber: "INV-000001",
        userId: mockUser.id,
        status: InvoiceStatus.DRAFT,
        total: 220,
        items: [],
        client: { name: "Test Client" },
        user: mockUser,
      };

      mockInvoiceRepository.findOne.mockResolvedValue(invoice);

      const result = await service.findOne("invoice-1", mockUser);

      expect(result).toEqual(invoice);
      expect(mockInvoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: "invoice-1", userId: mockUser.id },
        relations: ["client", "items", "user"],
      });
    });

    it("should throw NotFoundException if invoice not found", async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("invalid-id", mockUser)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("getDashboardStats", () => {
    it("should return dashboard statistics", async () => {
      const invoices = [
        {
          id: "invoice-1",
          status: InvoiceStatus.PAID,
          total: 100,
        },
        {
          id: "invoice-2",
          status: InvoiceStatus.SENT,
          total: 150,
        },
        {
          id: "invoice-3",
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

  describe("remove", () => {
    it("should remove an invoice", async () => {
      const invoice = {
        id: "invoice-1",
        invoiceNumber: "INV-000001",
        userId: mockUser.id,
      };

      mockInvoiceRepository.findOne.mockResolvedValue(invoice);
      mockInvoiceRepository.remove.mockResolvedValue(invoice);

      const result = await service.remove("invoice-1", mockUser);

      expect(result).toEqual({ deleted: true });
      expect(mockInvoiceRepository.remove).toHaveBeenCalledWith(invoice);
    });
  });

  describe("update", () => {
    it("should update an invoice with items", async () => {
      const existingInvoice = {
        id: "invoice-1",
        invoiceNumber: "INV-000001",
        userId: mockUser.id,
        clientId: "client-1",
        status: InvoiceStatus.DRAFT,
        issueDate: new Date("2024-01-01"),
        dueDate: new Date("2024-02-01"),
        taxRate: 10,
        subtotal: 200,
        taxAmount: 20,
        total: 220,
        notes: "Old notes",
        items: [
          {
            id: "item-1",
            description: "Old Item",
            quantity: 2,
            unitPrice: 100,
            amount: 200,
            invoiceId: "invoice-1",
          },
        ],
      };

      const updateDto = {
        status: InvoiceStatus.SENT,
        notes: "New notes",
        items: [
          {
            description: "New Item",
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

      const result = await service.update("invoice-1", updateDto, mockUser);

      expect(mockInvoiceItemRepository.delete).toHaveBeenCalledWith({
        invoiceId: "invoice-1",
      });
      expect(mockInvoiceRepository.save).toHaveBeenCalled();
    });
  });

  describe("calculateTotals", () => {
    it("should calculate totals correctly when IR is disabled (IR should not affect total)", () => {
      const items = [
        { quantity: 2, unitPrice: 50 }, // 100
        { quantity: 1, unitPrice: 100 }, // 100
      ]; // subtotal = 200

      const result = (service as any).calculateTotals(
        items,
        true,
        19.25,
        false,
        5.5
      );

      expect(result.subtotal).toBe(200);
      expect(result.tvaAmount).toBe(38.5); // 200 * 19.25%
      expect(result.irAmount).toBe(0); // IR disabled
      expect(result.total).toBe(238.5); // 200 + 38.5 (IR not included)
    });

    it("should calculate totals correctly when IR is enabled (IR should not affect total)", () => {
      const items = [
        { quantity: 2, unitPrice: 50 }, // 100
        { quantity: 1, unitPrice: 100 }, // 100
      ]; // subtotal = 200

      const result = (service as any).calculateTotals(
        items,
        true,
        19.25,
        true,
        5.5
      );

      expect(result.subtotal).toBe(200);
      expect(result.tvaAmount).toBe(38.5); // 200 * 19.25%
      expect(result.irAmount).toBe(11); // 200 * 5.5% = 11
      expect(result.total).toBe(238.5); // 200 + 38.5 (IR not included in total)
    });

    it("should calculate totals correctly when both TVA and IR are disabled", () => {
      const items = [
        { quantity: 1, unitPrice: 100 }, // 100
      ];

      const result = (service as any).calculateTotals(
        items,
        false,
        19.25,
        false,
        5.5
      );

      expect(result.subtotal).toBe(100);
      expect(result.tvaAmount).toBe(0);
      expect(result.irAmount).toBe(0);
      expect(result.total).toBe(100); // Only subtotal
    });

    it("should calculate totals correctly when discount is enabled", () => {
      const items = [
        { quantity: 2, unitPrice: 50 }, // 100
        { quantity: 1, unitPrice: 100 }, // 100
      ]; // subtotal = 200

      const result = (service as any).calculateTotals(
        items,
        true,
        19.25,
        false,
        5.5,
        true,
        10
      );

      expect(result.subtotal).toBe(200);
      expect(result.tvaAmount).toBe(38.5); // 200 * 19.25%
      expect(result.irAmount).toBe(0); // IR disabled
      expect(result.discountAmount).toBe(23.85); // (200 + 38.5) * 10% = 238.5 * 0.1
      expect(result.total).toBe(214.65); // 238.5 - 23.85
    });

    it("should calculate totals correctly when discount is enabled but rate is 0", () => {
      const items = [
        { quantity: 1, unitPrice: 100 }, // 100
      ];

      const result = (service as any).calculateTotals(
        items,
        true,
        20,
        false,
        5.5,
        true,
        0
      );

      expect(result.subtotal).toBe(100);
      expect(result.tvaAmount).toBe(20); // 100 * 20%
      expect(result.discountAmount).toBe(0); // 0% discount
      expect(result.total).toBe(120); // 120 - 0
    });

    it("should calculate totals correctly when discount is disabled", () => {
      const items = [
        { quantity: 1, unitPrice: 200 }, // 200
      ];

      const result = (service as any).calculateTotals(
        items,
        true,
        10,
        false,
        5.5,
        false,
        15
      );

      expect(result.subtotal).toBe(200);
      expect(result.tvaAmount).toBe(20); // 200 * 10%
      expect(result.discountAmount).toBe(0); // discount disabled
      expect(result.total).toBe(220); // 220 - 0
    });

    it("should calculate totals correctly with TVA, IR, and discount all enabled", () => {
      const items = [
        { quantity: 1, unitPrice: 1000 }, // 1000
      ];

      const result = (service as any).calculateTotals(
        items,
        true,
        20,
        true,
        5,
        true,
        10
      );

      expect(result.subtotal).toBe(1000);
      expect(result.tvaAmount).toBe(200); // 1000 * 20%
      expect(result.irAmount).toBe(50); // 1000 * 5%
      expect(result.discountAmount).toBe(120); // (1000 + 200) * 10% = 1200 * 0.1
      expect(result.total).toBe(1080); // 1200 - 120
    });
  });

  describe("generatePDF", () => {
    it("should generate PDF with company logo when user has companyLogo", async () => {
      const mockInvoice = {
        id: "invoice-1",
        invoiceNumber: "INV-001",
        type: InvoiceType.NORMAL,
        issueDate: new Date(),
        status: InvoiceStatus.SENT,
        subtotal: 1000,
        tvaEnabled: true,
        tvaRate: 20,
        tvaAmount: 200,
        irEnabled: false,
        irRate: 0,
        irAmount: 0,
        discountEnabled: false,
        discountRate: 0,
        discountAmount: 0,
        total: 1200,
        client: {
          id: "client-1",
          name: "Test Client",
          email: "client@example.com",
          companyName: "Client Company",
          address: "123 Client St",
          taxpayerNumber: "987654321",
          phone: "+0987654321",
        },
        items: [
          {
            id: "item-1",
            description: "Test Service",
            quantity: 1,
            unitPrice: 1000,
            amount: 1000,
          },
        ],
      };

      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        companyName: "Test Company",
        taxpayerNumber: "123456789",
        address: "123 Test St",
        companyLogo: "https://example.com/logo.png",
        language: "en",
        currency: "USD",
      };

      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);

      const result = await service.generatePDF("invoice-1", mockUser as User);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should generate PDF with logo placeholder when user has no companyLogo", async () => {
      const mockInvoice = {
        id: "invoice-1",
        invoiceNumber: "INV-001",
        type: InvoiceType.NORMAL,
        issueDate: new Date(),
        status: InvoiceStatus.SENT,
        subtotal: 1000,
        tvaEnabled: true,
        tvaRate: 20,
        tvaAmount: 200,
        irEnabled: false,
        irRate: 0,
        irAmount: 0,
        discountEnabled: false,
        discountRate: 0,
        discountAmount: 0,
        total: 1200,
        client: {
          id: "client-1",
          name: "Test Client",
          email: "client@example.com",
          companyName: "Client Company",
          address: "123 Client St",
          taxpayerNumber: "987654321",
          phone: "+0987654321",
        },
        items: [
          {
            id: "item-1",
            description: "Test Service",
            quantity: 1,
            unitPrice: 1000,
            amount: 1000,
          },
        ],
      };

      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        companyName: "Test Company",
        taxpayerNumber: "123456789",
        address: "123 Test St",
        companyLogo: null,
        language: "en",
        currency: "USD",
      };

      mockInvoiceRepository.findOne.mockResolvedValue(mockInvoice);

      const result = await service.generatePDF("invoice-1", mockUser as User);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
