import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Invoice, InvoiceStatus, InvoiceType } from "./invoice.entity";
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

  private calculateTotals(
    items: any[],
    tvaEnabled: boolean = false,
    tvaRate: number = 19.25,
    irEnabled: boolean = false,
    irRate: number = 5.5
  ) {
    const subtotal = items.reduce((sum, item) => {
      const amount = item.quantity * item.unitPrice;
      return sum + amount;
    }, 0);

    const tvaAmount = tvaEnabled ? (subtotal * tvaRate) / 100 : 0;
    const irAmount = irEnabled ? (subtotal * irRate) / 100 : 0;
    const total = subtotal + tvaAmount; // IR doesn't affect the total, only displayed when enabled

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tvaAmount: parseFloat(tvaAmount.toFixed(2)),
      irAmount: parseFloat(irAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  private async generateInvoiceNumber(
    type: InvoiceType = InvoiceType.NORMAL
  ): Promise<string> {
    const count = await this.invoicesRepository.count({ where: { type } });
    const prefix = type === InvoiceType.PROFORMA ? "PRO" : "INV";
    const invoiceNumber = `${prefix}-${String(count + 1).padStart(6, "0")}`;
    return invoiceNumber;
  }

  async create(createInvoiceDto: CreateInvoiceDto, user: User) {
    const {
      items,
      tvaEnabled = false,
      tvaRate = 19.25,
      irEnabled = false,
      irRate = 5.5,
      status,
      ...invoiceData
    } = createInvoiceDto;

    const totals = this.calculateTotals(
      items,
      tvaEnabled,
      tvaRate,
      irEnabled,
      irRate
    );
    const invoiceNumber = await this.generateInvoiceNumber(
      invoiceData.type || InvoiceType.NORMAL
    );

    const invoice = this.invoicesRepository.create({
      ...invoiceData,
      invoiceNumber,
      userId: user.id,
      tvaEnabled,
      tvaRate,
      irEnabled,
      irRate,
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

    const { items, tvaEnabled, tvaRate, irEnabled, irRate, ...updateData } =
      updateInvoiceDto;

    if (items) {
      await this.invoiceItemsRepository.delete({ invoiceId: id });

      const newTvaEnabled =
        tvaEnabled !== undefined ? tvaEnabled : invoice.tvaEnabled;
      const newTvaRate = tvaRate !== undefined ? tvaRate : invoice.tvaRate;
      const newIrEnabled =
        irEnabled !== undefined ? irEnabled : invoice.irEnabled;
      const newIrRate = irRate !== undefined ? irRate : invoice.irRate;

      const totals = this.calculateTotals(
        items,
        newTvaEnabled,
        newTvaRate,
        newIrEnabled,
        newIrRate
      );

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
      Object.assign(invoice, updateData, {
        tvaEnabled: newTvaEnabled,
        tvaRate: newTvaRate,
        irEnabled: newIrEnabled,
        irRate: newIrRate,
        ...totals,
      });
    } else {
      Object.assign(invoice, updateData);
      if (
        tvaEnabled !== undefined ||
        tvaRate !== undefined ||
        irEnabled !== undefined ||
        irRate !== undefined
      ) {
        const newTvaEnabled =
          tvaEnabled !== undefined ? tvaEnabled : invoice.tvaEnabled;
        const newTvaRate = tvaRate !== undefined ? tvaRate : invoice.tvaRate;
        const newIrEnabled =
          irEnabled !== undefined ? irEnabled : invoice.irEnabled;
        const newIrRate = irRate !== undefined ? irRate : invoice.irRate;

        invoice.tvaEnabled = newTvaEnabled;
        invoice.tvaRate = newTvaRate;
        invoice.irEnabled = newIrEnabled;
        invoice.irRate = newIrRate;

        const items = await this.invoiceItemsRepository.find({
          where: { invoiceId: id },
        });
        const totals = this.calculateTotals(
          items,
          newTvaEnabled,
          newTvaRate,
          newIrEnabled,
          newIrRate
        );
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
          Title: `${
            invoice.type === InvoiceType.PROFORMA
              ? "Proforma Invoice"
              : "Invoice"
          } ${invoice.invoiceNumber}`,
          Author: user.companyName || `${user.firstName} ${user.lastName}`,
          Subject: `${
            invoice.type === InvoiceType.PROFORMA
              ? "Proforma Invoice"
              : "Invoice"
          } for ${invoice.client.name}`,
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
      // Invoice title
      doc.fillColor(colors.primary).fontSize(28).font("Helvetica-Bold");
      doc.text("INVOICE", 50, yPosition);

      // Logo placeholder
      drawRoundedRect(450, yPosition, 100, 40, 5, colors.light);
      doc
        .strokeColor(colors.border)
        .lineWidth(1)
        .roundedRect(450, yPosition, 100, 40, 5)
        .stroke();
      doc.fillColor(colors.primary).fontSize(16).font("Helvetica-Bold");
      doc.text("LOGO", 470, yPosition + 12);

      yPosition += 60;

      // ===== TO SECTION (LEFT) =====
      doc.fillColor(colors.dark).fontSize(12).font("Helvetica-Bold");
      doc.text("TO:", 50, yPosition);
      yPosition += 20;

      // Client details (left aligned)
      doc.fillColor(colors.secondary).fontSize(10).font("Helvetica");
      const clientName = `${invoice.client.name}`;
      doc.text(clientName, 50, yPosition);
      yPosition += 15;

      const companyName = invoice.client.companyName || "";
      if (companyName) {
        doc.text(companyName, 50, yPosition);
        yPosition += 15;
      }

      const address = invoice.client.address || "";
      if (address) {
        doc.text(address, 50, yPosition);
        yPosition += 15;
      }

      const taxpayer = invoice.client.taxpayerNumber || "";
      if (taxpayer) {
        doc.text(`Taxpayer number: ${taxpayer}`, 50, yPosition);
        yPosition += 15;
      }

      const phone = invoice.client.phone || "";
      if (phone) {
        doc.text(`Phone number: ${phone}`, 50, yPosition);
        yPosition += 15;
      }

      doc.text(invoice.client.email || "", 50, yPosition);
      yPosition += 60; // Space before table

      // ===== INVOICE NUMBER AND DATE (RIGHT) =====
      const rightX = 400;
      doc.fillColor(colors.dark).fontSize(10).font("Helvetica-Bold");
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, rightX, 110);
      doc.text(
        `Invoice Date: ${formatDate(new Date(invoice.issueDate))}`,
        rightX,
        130
      );

      // ===== SERVICE DETAILS TABLE =====
      yPosition = 220; // Reset to after header
      doc.fillColor(colors.dark).fontSize(16).font("Helvetica-Bold");
      doc.text("Service Details", 50, yPosition);
      yPosition += 30;

      // Table header
      const tableX = 50;
      const tableWidth = 500;
      const headerHeight = 25;
      drawRoundedRect(
        tableX,
        yPosition,
        tableWidth,
        headerHeight,
        4,
        colors.primary
      );
      doc.fillColor("white").fontSize(11).font("Helvetica-Bold");
      doc.text("Items", tableX + 10, yPosition + 7, { width: 300 });
      doc.text("Qty", tableX + 320, yPosition + 7);
      doc.text("Unit price", tableX + 370, yPosition + 7);
      doc.text("Amount", tableX + 450, yPosition + 7);

      yPosition += headerHeight + 5;

      // Table rows
      let alternateRow = false;
      let tableEndY = yPosition;
      invoice.items.forEach((item) => {
        const rowHeight = 25;

        // Alternate row background
        if (alternateRow) {
          drawRect(
            tableX + 1,
            yPosition + 1,
            tableWidth - 2,
            rowHeight - 2,
            "#f0f0f0"
          );
        }

        // Borders
        doc
          .strokeColor(colors.border)
          .lineWidth(0.5)
          .moveTo(tableX, yPosition)
          .lineTo(tableX + tableWidth, yPosition)
          .moveTo(tableX, yPosition + rowHeight)
          .lineTo(tableX + tableWidth, yPosition + rowHeight)
          .stroke();

        // Item details
        doc.fillColor(colors.dark).fontSize(10).font("Helvetica");
        doc.text(item.description || "", tableX + 10, yPosition + 5, {
          width: 300,
        });

        doc.text(item.quantity.toString(), tableX + 320, yPosition + 5);
        doc.text(
          formatCurrency(parseFloat(item.unitPrice.toString())),
          tableX + 370,
          yPosition + 5
        );
        doc.text(
          formatCurrency(parseFloat(item.amount.toString())),
          tableX + 450,
          yPosition + 5
        );

        yPosition += rowHeight;
        tableEndY = yPosition;
        alternateRow = !alternateRow;
      });

      // Table bottom border
      doc
        .strokeColor(colors.primary)
        .lineWidth(1.5)
        .moveTo(tableX, tableEndY)
        .lineTo(tableX + tableWidth, tableEndY)
        .stroke();

      yPosition = tableEndY + 20;

      // ===== TOTALS SECTION (RIGHT ALIGNED) =====
      const totalsStartY = yPosition;
      const totalsX = 300;
      const totalsLabelWidth = 100;
      const totalsAmountX = totalsX + totalsLabelWidth + 20;

      doc.fillColor(colors.secondary).fontSize(10).font("Helvetica");
      doc.text("Subtotal", totalsX, totalsStartY);
      doc.fillColor(colors.dark).font("Helvetica-Bold");
      doc.text(
        formatCurrency(parseFloat(invoice.subtotal.toString())),
        totalsAmountX,
        totalsStartY,
        { align: "right", width: 100 }
      );

      let totalsY = totalsStartY + 20;

      if (invoice.tvaEnabled) {
        doc.fillColor(colors.secondary).font("Helvetica");
        doc.text(`TVA(${invoice.tvaRate}%)`, totalsX, totalsY);
        doc.fillColor(colors.dark).font("Helvetica-Bold");
        doc.text(
          formatCurrency(parseFloat(invoice.tvaAmount.toString())),
          totalsAmountX,
          totalsY,
          { align: "right", width: 100 }
        );
        totalsY += 20;
      }

      if (invoice.irEnabled) {
        doc.fillColor(colors.secondary).font("Helvetica");
        doc.text(`IR(${invoice.irRate}%)`, totalsX, totalsY);
        doc.fillColor(colors.dark).font("Helvetica-Bold");
        doc.text(
          formatCurrency(parseFloat(invoice.irAmount.toString())),
          totalsAmountX,
          totalsY,
          { align: "right", width: 100 }
        );
        totalsY += 20;
      }

      // Total
      doc.fillColor(colors.primary).fontSize(12).font("Helvetica-Bold");
      doc.text("TOTAL", totalsX, totalsY);
      doc.text(
        formatCurrency(parseFloat(invoice.total.toString())),
        totalsAmountX,
        totalsY,
        { align: "right", width: 100 }
      );

      yPosition = totalsY + 40;

      // ===== APPROVAL TEXT =====
      doc.fillColor(colors.muted).fontSize(10).font("Helvetica-Oblique");
      const totalInWords = "Total amount in letters"; // Placeholder - implement number to words if needed
      doc.text(
        `Approved on this invoice the sum of: ${totalInWords}`,
        50,
        yPosition
      );
      yPosition += 30;

      // ===== FOOTER =====
      const pageHeight = doc.page.height;

      // Footer line (fixed near bottom)
      const footerLineY = pageHeight - 60;
      doc
        .strokeColor(colors.primary)
        .lineWidth(1)
        .moveTo(50, footerLineY)
        .lineTo(545, footerLineY)
        .stroke();

      // Company info just below the line
      doc.fillColor(colors.secondary).fontSize(9).font("Helvetica");
      const companyInfo = [
        user.companyName || `${user.firstName || ""} ${user.lastName || ""}`,
        user.email || "",
        user.address || "",
        user.taxpayerNumber ? `Taxpayer No: ${user.taxpayerNumber}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      doc.text(companyInfo, 50, footerLineY + 3, {
        width: 495,
        align: "left",
      });

      // Thank-you note centered just below company info
      doc.fillColor(colors.muted).fontSize(8).font("Helvetica-Oblique");
      doc.text("Thank you for your business!", 50, footerLineY + 18, {
        align: "center",
        width: 495,
      });

      doc.end();
    });
  }
}
