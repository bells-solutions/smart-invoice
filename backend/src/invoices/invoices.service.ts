import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Invoice, InvoiceStatus } from "./invoice.entity";
import { InvoiceItem } from "./invoice-item.entity";
import { CreateInvoiceDto, UpdateInvoiceDto } from "./invoice.dto";
import { User } from "../users/user.entity";
import PDFDocument from "pdfkit";

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>
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
    const invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;
    return invoiceNumber;
  }

  async create(createInvoiceDto: CreateInvoiceDto, user: User) {
    const { items, taxRate = 0, status, ...invoiceData } = createInvoiceDto;

    const totals = this.calculateTotals(items, taxRate);
    const invoiceNumber = await this.generateInvoiceNumber();

    const invoice = this.invoicesRepository.create({
      ...invoiceData,
      invoiceNumber,
      userId: user.id,
      taxRate,
      status: status || InvoiceStatus.DRAFT,
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
      relations: ["client", "items"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string, user: User) {
    const invoice = await this.invoicesRepository.findOne({
      where: { id, userId: user.id },
      relations: ["client", "items", "user"],
    });
    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }
    // Remove circular relations to avoid JSON serialization errors when returning
    if (invoice.user && (invoice.user as any).invoices) {
      try {
        delete (invoice.user as any).invoices;
      } catch (e) {
        // ignore
      }
    }
    // Remove sensitive fields
    if (invoice.user && (invoice.user as any).password) {
      try {
        delete (invoice.user as any).password;
      } catch (e) {
        // ignore
      }
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

      // Set the items relationship on the invoice before saving
      invoice.items = invoiceItems;
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
      0
    );

    const unpaidInvoices = invoices.filter(
      (invoice) =>
        invoice.status === InvoiceStatus.SENT ||
        invoice.status === InvoiceStatus.OVERDUE
    );

    const unpaidAmount = unpaidInvoices.reduce(
      (sum, invoice) => sum + parseFloat(invoice.total.toString()),
      0
    );

    return {
      totalInvoices: invoices.length,
      totalSales: parseFloat(totalSales.toFixed(2)),
      unpaidInvoices: unpaidInvoices.length,
      unpaidAmount: parseFloat(unpaidAmount.toFixed(2)),
      paidInvoices: invoices.filter(
        (invoice) => invoice.status === InvoiceStatus.PAID
      ).length,
    };
  }

  async generatePDF(id: string, user: User): Promise<Buffer> {
    const invoice = await this.findOne(id, user);

    return new Promise((resolve, reject) => {
      // Create PDF with professional settings
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        bufferPages: true,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: user.companyName || `${user.firstName} ${user.lastName}`,
          Subject: `Invoice for ${invoice.client.name}`,
          Keywords: "invoice, bill, payment",
          CreationDate: new Date(),
        },
      });

      const buffers: Buffer[] = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Professional color palette
      const colors = {
        primary: "#1e40af", // Blue-800
        secondary: "#64748b", // Slate-500
        accent: "#10b981", // Emerald-500
        success: "#059669", // Emerald-600
        warning: "#d97706", // Amber-600
        danger: "#dc2626", // Red-600
        light: "#f8fafc", // Slate-50
        dark: "#334155", // Slate-700
        muted: "#64748b", // Slate-500
        border: "#e2e8f0", // Slate-200
      };

      // Helper functions
      const drawRect = (
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
      ) => {
        doc.fillColor(color).rect(x, y, width, height).fill();
      };

      const drawRoundedRect = (
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        color: string
      ) => {
        doc.fillColor(color).roundedRect(x, y, width, height, radius).fill();
      };

      const drawStatusBadge = (status: string, x: number, y: number) => {
        let bgColor = "#fef3c7"; // Yellow-100
        let textColor = "#92400e"; // Yellow-800
        let statusText = status.toUpperCase();

        switch (status.toLowerCase()) {
          case "paid":
            bgColor = "#d1fae5"; // Green-100
            textColor = "#065f46"; // Green-800
            break;
          case "sent":
            bgColor = "#dbeafe"; // Blue-100
            textColor = "#1e40af"; // Blue-800
            break;
          case "overdue":
            bgColor = "#fee2e2"; // Red-100
            textColor = "#991b1b"; // Red-800
            break;
        }

        // Draw badge background with rounded corners
        doc.fillColor(bgColor).roundedRect(x, y, 70, 22, 11).fill();
        // Draw badge border
        doc
          .strokeColor(textColor)
          .lineWidth(0.5)
          .roundedRect(x, y, 70, 22, 11)
          .stroke();
        // Draw badge text
        doc
          .fillColor(textColor)
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(statusText, x + 8, y + 7);
      };

      const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

      const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

      let yPosition = 50;

      // ===== HEADER SECTION =====
      // Decorative background
      drawRoundedRect(0, 0, 595, 140, 0, colors.light);

      // Company branding section
      doc.fillColor(colors.primary).fontSize(28).font("Helvetica-Bold");
      const companyName = user.companyName || "Your Company";
      doc.text(companyName, 50, 25);

      // Company tagline
      doc.fillColor(colors.muted).fontSize(10).font("Helvetica");
      doc.text("Professional Invoicing Solutions", 50, 55);

      // Company contact info
      doc.fillColor(colors.secondary).fontSize(9).font("Helvetica");
      doc.text(`${user.firstName} ${user.lastName}`, 50, 75);
      doc.text("Email: contact@company.com", 50, 88);
      doc.text("Phone: (555) 123-4567", 50, 101);
      doc.text("Website: www.company.com", 50, 114);

      // Invoice title with modern styling
      drawRoundedRect(380, 20, 140, 40, 8, colors.primary);
      doc.fillColor("white").fontSize(16).font("Helvetica-Bold");
      doc.text("INVOICE", 410, 32);

      // Invoice number with background
      drawRoundedRect(380, 70, 140, 35, 6, colors.light);
      doc
        .strokeColor(colors.border)
        .lineWidth(1)
        .roundedRect(380, 70, 140, 35, 6)
        .stroke();
      doc.fillColor(colors.primary).fontSize(12).font("Helvetica-Bold");
      doc.text(`#${invoice.invoiceNumber}`, 390, 80);

      yPosition = 160;

      // ===== INVOICE DETAILS SECTION =====
      doc.fillColor(colors.dark).fontSize(16).font("Helvetica-Bold");
      doc.text("Invoice Details", 50, yPosition);
      yPosition += 25;

      // Details grid with modern styling
      const detailsY = yPosition;

      // Left column labels
      doc.fillColor(colors.muted).fontSize(10).font("Helvetica");
      doc.text("Issue Date:", 50, detailsY);
      doc.text("Due Date:", 50, detailsY + 18);
      doc.text("Status:", 50, detailsY + 36);

      // Right column values
      doc.fillColor(colors.dark).font("Helvetica-Bold");
      const issueDate = formatDate(new Date(invoice.issueDate));
      const dueDate = formatDate(new Date(invoice.dueDate));

      doc.text(issueDate, 130, detailsY);
      doc.text(dueDate, 130, detailsY + 18);

      // Status badge
      drawStatusBadge(invoice.status, 130, detailsY + 36);

      yPosition += 70;

      // ===== BILL TO SECTION =====
      doc.fillColor(colors.dark).fontSize(16).font("Helvetica-Bold");
      doc.text("Bill To:", 50, yPosition);
      yPosition += 20;

      // Client info card
      drawRoundedRect(45, yPosition - 8, 280, 70, 8, colors.light);
      doc
        .strokeColor(colors.border)
        .lineWidth(1)
        .roundedRect(45, yPosition - 8, 280, 70, 8)
        .stroke();

      // Client avatar placeholder
      drawRoundedRect(55, yPosition, 30, 30, 15, colors.primary);
      doc.fillColor("white").fontSize(12).font("Helvetica-Bold");
      doc.text(invoice.client.name.charAt(0).toUpperCase(), 65, yPosition + 9);

      // Client details
      doc.fillColor(colors.dark).fontSize(14).font("Helvetica-Bold");
      doc.text(invoice.client.name, 95, yPosition + 5);

      doc.fillColor(colors.secondary).fontSize(10).font("Helvetica");
      doc.text(invoice.client.email, 95, yPosition + 22);

      if (invoice.client.address) {
        doc.text(invoice.client.address, 95, yPosition + 35);
      }

      if (invoice.client.city || invoice.client.country) {
        const location = [invoice.client.city, invoice.client.country]
          .filter(Boolean)
          .join(", ");
        doc.text(location, 95, yPosition + 48);
      }

      yPosition += 85;

      // ===== ITEMS TABLE =====
      doc.fillColor(colors.dark).fontSize(16).font("Helvetica-Bold");
      doc.text("Items & Services", 50, yPosition);
      yPosition += 20;

      // Table header with gradient
      drawRoundedRect(45, yPosition, 500, 30, 6, colors.primary);
      doc.fillColor("white").fontSize(11).font("Helvetica-Bold");
      doc.text("Description", 55, yPosition + 9);
      doc.text("Qty", 330, yPosition + 9);
      doc.text("Rate", 390, yPosition + 9);
      doc.text("Amount", 470, yPosition + 9);

      yPosition += 35;

      // Table rows with alternating colors
      let alternateRow = false;
      invoice.items.forEach((item) => {
        const rowHeight = 28;

        // Alternate row background
        if (alternateRow) {
          drawRoundedRect(45, yPosition, 500, rowHeight, 4, "#fafbfc");
        }

        // Item details
        doc.fillColor(colors.dark).fontSize(10).font("Helvetica");
        doc.text(item.description, 55, yPosition + 8, { width: 250 });

        doc.text(item.quantity.toString(), 330, yPosition + 8);
        doc.text(
          formatCurrency(parseFloat(item.unitPrice.toString())),
          390,
          yPosition + 8
        );
        doc.text(
          formatCurrency(parseFloat(item.amount.toString())),
          470,
          yPosition + 8
        );

        yPosition += rowHeight;
        alternateRow = !alternateRow;
      });

      // Table bottom border
      doc
        .strokeColor(colors.primary)
        .lineWidth(2)
        .moveTo(45, yPosition)
        .lineTo(545, yPosition)
        .stroke();

      yPosition += 25;

      // ===== TOTALS SECTION =====
      const totalsX = 320;
      const totalsWidth = 225;

      // Totals background with shadow effect
      drawRoundedRect(
        totalsX - 3,
        yPosition - 8,
        totalsWidth,
        85,
        8,
        colors.light
      );
      doc
        .strokeColor(colors.border)
        .lineWidth(1)
        .roundedRect(totalsX - 3, yPosition - 8, totalsWidth, 85, 8)
        .stroke();

      doc.fillColor(colors.secondary).fontSize(10).font("Helvetica");

      // Subtotal
      doc.text("Subtotal:", totalsX + 5, yPosition);
      doc.fillColor(colors.dark).font("Helvetica-Bold");
      doc.text(
        formatCurrency(parseFloat(invoice.subtotal.toString())),
        totalsX + 140,
        yPosition,
        { align: "right" }
      );

      // Tax
      yPosition += 20;
      doc.fillColor(colors.secondary).font("Helvetica");
      doc.text(`Tax (${invoice.taxRate}%):`, totalsX + 5, yPosition);
      doc.fillColor(colors.dark).font("Helvetica-Bold");
      doc.text(
        formatCurrency(parseFloat(invoice.taxAmount.toString())),
        totalsX + 140,
        yPosition,
        { align: "right" }
      );

      // Total with accent background
      yPosition += 25;
      drawRoundedRect(
        totalsX - 3,
        yPosition - 5,
        totalsWidth,
        30,
        6,
        colors.primary
      );
      doc.fillColor("white").fontSize(14).font("Helvetica-Bold");
      doc.text("TOTAL:", totalsX + 5, yPosition);
      doc.text(
        formatCurrency(parseFloat(invoice.total.toString())),
        totalsX + 140,
        yPosition,
        { align: "right" }
      );

      yPosition += 50;

      // ===== NOTES SECTION =====
      if (invoice.notes) {
        doc.fillColor(colors.dark).fontSize(12).font("Helvetica-Bold");
        doc.text("Notes:", 50, yPosition);
        yPosition += 15;

        // Notes background
        drawRoundedRect(45, yPosition - 5, 500, 40, 4, "#fefefe");
        doc
          .strokeColor(colors.border)
          .lineWidth(1)
          .roundedRect(45, yPosition - 5, 500, 40, 4)
          .stroke();

        doc.fillColor(colors.secondary).fontSize(10).font("Helvetica");
        doc.text(invoice.notes, 55, yPosition, { width: 480 });
        yPosition += 50;
      }

      // ===== FOOTER =====
      const footerY = 750;

      // Footer decorative line
      doc
        .strokeColor(colors.primary)
        .lineWidth(3)
        .moveTo(50, footerY)
        .lineTo(545, footerY)
        .stroke();

      // Footer content
      doc.fillColor(colors.secondary).fontSize(9).font("Helvetica");
      doc.text("Thank you for your business!", 50, footerY + 15);

      doc.text(
        "Payment Terms: Net 30 days • Please include invoice number on all payments",
        50,
        footerY + 30
      );
      doc.text(
        "For questions about this invoice, please contact us at contact@company.com",
        50,
        footerY + 42
      );

      // Company footer
      doc.fillColor(colors.primary).fontSize(10).font("Helvetica-Bold");
      doc.text(
        `${companyName} • ${user.firstName} ${user.lastName}`,
        400,
        footerY + 15,
        { align: "right" }
      );
      doc.text("contact@company.com • (555) 123-4567", 400, footerY + 30, {
        align: "right",
      });

      // Page info
      doc.fillColor(colors.muted).fontSize(8).font("Helvetica");
      doc.text(
        `Generated on ${formatDate(new Date())} • Page 1 of 1`,
        400,
        footerY + 42,
        { align: "right" }
      );

      doc.end();
    });
  }
}
