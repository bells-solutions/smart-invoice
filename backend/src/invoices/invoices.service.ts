import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoice.dto';
import { User } from '../users/user.entity';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
  ) {}

  private calculateTotals(items: any[], taxRate: number) {
    const subtotal = items.reduce((sum, item) => {
      const amount = item.quantity * item.unitPrice;
      return sum + amount;
    }, 0);

    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const count = await this.invoicesRepository.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(6, '0')}`;
    return invoiceNumber;
  }

  async create(createInvoiceDto: CreateInvoiceDto, user: User) {
    const { items, taxRate = 0, ...invoiceData } = createInvoiceDto;

    const totals = this.calculateTotals(items, taxRate);
    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = this.invoicesRepository.create({
      ...invoiceData,
      invoiceNumber,
      userId: user.id,
      taxRate,
      ...totals,
    });

    const savedInvoice = await this.invoicesRepository.save(invoice);

    const invoiceItems = items.map((item) => {
      const amount = item.quantity * item.unitPrice;
      return this.invoiceItemsRepository.create({
        ...item,
        amount: parseFloat(amount.toFixed(2)),
        invoiceId: savedInvoice.id,
      });
    });

    await this.invoiceItemsRepository.save(invoiceItems);

    return this.findOne(savedInvoice.id, user);
  }

  async findAll(user: User) {
    return await this.invoicesRepository.find({
      where: { userId: user.id },
      relations: ['client', 'items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const invoice = await this.invoicesRepository.findOne({
      where: { id, userId: user.id },
      relations: ['client', 'items', 'user'],
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, user: User) {
    const invoice = await this.findOne(id, user);

    const { items, taxRate, ...updateData } = updateInvoiceDto;

    if (items) {
      await this.invoiceItemsRepository.delete({ invoiceId: id });

      const newTaxRate = taxRate !== undefined ? taxRate : invoice.taxRate;
      const totals = this.calculateTotals(items, newTaxRate);

      const invoiceItems = items.map((item) => {
        const amount = item.quantity * item.unitPrice;
        return this.invoiceItemsRepository.create({
          ...item,
          amount: parseFloat(amount.toFixed(2)),
          invoiceId: id,
        });
      });

      await this.invoiceItemsRepository.save(invoiceItems);

      Object.assign(invoice, updateData, { taxRate: newTaxRate, ...totals });
    } else {
      Object.assign(invoice, updateData);
      if (taxRate !== undefined) {
        invoice.taxRate = taxRate;
        const items = await this.invoiceItemsRepository.find({
          where: { invoiceId: id },
        });
        const totals = this.calculateTotals(items, taxRate);
        Object.assign(invoice, totals);
      }
    }

    await this.invoicesRepository.save(invoice);
    return this.findOne(id, user);
  }

  async remove(id: string, user: User) {
    const invoice = await this.findOne(id, user);
    await this.invoicesRepository.remove(invoice);
    return { deleted: true };
  }

  async getDashboardStats(user: User) {
    const invoices = await this.invoicesRepository.find({
      where: { userId: user.id },
    });

    const totalSales = invoices.reduce(
      (sum, invoice) => sum + parseFloat(invoice.total.toString()),
      0,
    );

    const unpaidInvoices = invoices.filter(
      (invoice) =>
        invoice.status === InvoiceStatus.SENT ||
        invoice.status === InvoiceStatus.OVERDUE,
    );

    const unpaidAmount = unpaidInvoices.reduce(
      (sum, invoice) => sum + parseFloat(invoice.total.toString()),
      0,
    );

    return {
      totalInvoices: invoices.length,
      totalSales: parseFloat(totalSales.toFixed(2)),
      unpaidInvoices: unpaidInvoices.length,
      unpaidAmount: parseFloat(unpaidAmount.toFixed(2)),
      paidInvoices: invoices.filter(
        (invoice) => invoice.status === InvoiceStatus.PAID,
      ).length,
    };
  }

  async generatePDF(id: string, user: User): Promise<Buffer> {
    const invoice = await this.findOne(id, user);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      if (user.companyLogo) {
        // Add logo if available
        doc.fontSize(20).text(user.companyName || 'Invoice', 50, 50);
      } else {
        doc.fontSize(20).text(user.companyName || 'Invoice', 50, 50);
      }

      doc
        .fontSize(10)
        .text(`${user.firstName} ${user.lastName}`, 50, 80)
        .moveDown();

      // Invoice details
      doc
        .fontSize(16)
        .text(`Invoice #${invoice.invoiceNumber}`, 50, 150)
        .fontSize(10)
        .text(`Issue Date: ${invoice.issueDate}`, 50, 180)
        .text(`Due Date: ${invoice.dueDate}`, 50, 195)
        .moveDown();

      // Client details
      doc
        .fontSize(12)
        .text('Bill To:', 50, 230)
        .fontSize(10)
        .text(invoice.client.name, 50, 250)
        .text(invoice.client.email, 50, 265);

      if (invoice.client.address) {
        doc.text(invoice.client.address, 50, 280);
      }
      if (invoice.client.city) {
        doc.text(
          `${invoice.client.city}${invoice.client.country ? ', ' + invoice.client.country : ''}`,
          50,
          295,
        );
      }

      // Items table
      const tableTop = 350;
      doc
        .fontSize(10)
        .text('Description', 50, tableTop)
        .text('Qty', 300, tableTop)
        .text('Price', 370, tableTop)
        .text('Amount', 470, tableTop);

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      let y = tableTop + 25;
      invoice.items.forEach((item) => {
        doc
          .text(item.description, 50, y)
          .text(item.quantity.toString(), 300, y)
          .text(`$${parseFloat(item.unitPrice.toString()).toFixed(2)}`, 370, y)
          .text(`$${parseFloat(item.amount.toString()).toFixed(2)}`, 470, y);
        y += 25;
      });

      // Totals
      y += 20;
      doc
        .text('Subtotal:', 370, y)
        .text(
          `$${parseFloat(invoice.subtotal.toString()).toFixed(2)}`,
          470,
          y,
        );

      y += 20;
      doc
        .text(`Tax (${invoice.taxRate}%):`, 370, y)
        .text(
          `$${parseFloat(invoice.taxAmount.toString()).toFixed(2)}`,
          470,
          y,
        );

      y += 20;
      doc
        .fontSize(12)
        .text('Total:', 370, y)
        .text(`$${parseFloat(invoice.total.toString()).toFixed(2)}`, 470, y);

      // Notes
      if (invoice.notes) {
        y += 50;
        doc.fontSize(10).text('Notes:', 50, y).text(invoice.notes, 50, y + 15);
      }

      doc.end();
    });
  }
}
