import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Invoice, InvoiceStatus, InvoiceType } from "./invoice.entity";
import { InvoiceItem } from "./invoice-item.entity";
import { CreateInvoiceDto, UpdateInvoiceDto } from "./invoice.dto";
import { User } from "../users/user.entity";
import { MailService } from "../mail/mail.service";
import PDFDocument from "pdfkit";
import * as https from "https";
import * as http from "http";

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
    private mailService: MailService
  ) {}

  private calculateTotals(
    items: any[],
    tvaEnabled: boolean = false,
    tvaRate: number = 19.25,
    irEnabled: boolean = false,
    irRate: number = 5.5,
    discountEnabled: boolean = false,
    discountRate: number = 0
  ) {
    const subtotal = items.reduce((sum, item) => {
      const amount = item.quantity * item.unitPrice;
      return sum + amount;
    }, 0);

    const tvaAmount = tvaEnabled ? (subtotal * tvaRate) / 100 : 0;
    const irAmount = irEnabled ? (subtotal * irRate) / 100 : 0;
    const subtotalWithTva = subtotal + tvaAmount;
    const discountAmount = discountEnabled
      ? (subtotalWithTva * discountRate) / 100
      : 0;
    const total = subtotalWithTva - discountAmount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tvaAmount: parseFloat(tvaAmount.toFixed(2)),
      irAmount: parseFloat(irAmount.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  private async fetchImageFromUrl(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith("https://") ? https : http;
      protocol
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to fetch image: ${response.statusCode}`));
            return;
          }

          const chunks: Buffer[] = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => resolve(Buffer.concat(chunks)));
          response.on("error", reject);
        })
        .on("error", reject);
    });
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
      discountEnabled = false,
      discountRate = 0,
      status,
      ...invoiceData
    } = createInvoiceDto;

    const totals = this.calculateTotals(
      items,
      tvaEnabled,
      tvaRate,
      irEnabled,
      irRate,
      discountEnabled,
      discountRate
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
      discountEnabled,
      discountRate,
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

    const {
      items,
      tvaEnabled,
      tvaRate,
      irEnabled,
      irRate,
      discountEnabled,
      discountRate,
      ...updateData
    } = updateInvoiceDto;

    if (items) {
      await this.invoiceItemsRepository.delete({ invoiceId: id });

      const newTvaEnabled =
        tvaEnabled !== undefined ? tvaEnabled : invoice.tvaEnabled;
      const newTvaRate = tvaRate !== undefined ? tvaRate : invoice.tvaRate;
      const newIrEnabled =
        irEnabled !== undefined ? irEnabled : invoice.irEnabled;
      const newIrRate = irRate !== undefined ? irRate : invoice.irRate;
      const newDiscountEnabled =
        discountEnabled !== undefined
          ? discountEnabled
          : invoice.discountEnabled;
      const newDiscountRate =
        discountRate !== undefined ? discountRate : invoice.discountRate;

      const totals = this.calculateTotals(
        items,
        newTvaEnabled,
        newTvaRate,
        newIrEnabled,
        newIrRate,
        newDiscountEnabled,
        newDiscountRate
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
        discountEnabled: newDiscountEnabled,
        discountRate: newDiscountRate,
        ...totals,
      });
    } else {
      Object.assign(invoice, updateData);
      if (
        tvaEnabled !== undefined ||
        tvaRate !== undefined ||
        irEnabled !== undefined ||
        irRate !== undefined ||
        discountEnabled !== undefined ||
        discountRate !== undefined
      ) {
        const newTvaEnabled =
          tvaEnabled !== undefined ? tvaEnabled : invoice.tvaEnabled;
        const newTvaRate = tvaRate !== undefined ? tvaRate : invoice.tvaRate;
        const newIrEnabled =
          irEnabled !== undefined ? irEnabled : invoice.irEnabled;
        const newIrRate = irRate !== undefined ? irRate : invoice.irRate;
        const newDiscountEnabled =
          discountEnabled !== undefined
            ? discountEnabled
            : invoice.discountEnabled;
        const newDiscountRate =
          discountRate !== undefined ? discountRate : invoice.discountRate;

        invoice.tvaEnabled = newTvaEnabled;
        invoice.tvaRate = newTvaRate;
        invoice.irEnabled = newIrEnabled;
        invoice.irRate = newIrRate;
        invoice.discountEnabled = newDiscountEnabled;
        invoice.discountRate = newDiscountRate;

        const items = await this.invoiceItemsRepository.find({
          where: { invoiceId: id },
        });

        const totals = this.calculateTotals(
          items,
          newTvaEnabled,
          newTvaRate,
          newIrEnabled,
          newIrRate,
          newDiscountEnabled,
          newDiscountRate
        );
        Object.assign(invoice, totals);
      }
    }

    // Check if status changed to 'sent' to trigger email
    const previousStatus = await this.invoicesRepository.findOne({
      where: { id },
      select: ["status"],
    });

    await this.invoicesRepository.save(invoice);
    const updatedInvoice = await this.findOne(id, user);

    // Send email if status changed from non-sent to sent
    if (
      updateData.status === InvoiceStatus.SENT &&
      previousStatus?.status !== InvoiceStatus.SENT
    ) {
      try {
        const invoiceWithRelations = await this.invoicesRepository.findOne({
          where: { id },
          relations: ["user", "client"],
        });

        if (invoiceWithRelations) {
          // Generate PDF for attachment
          const pdfBuffer = await this.generatePDF(id, user);
          await this.mailService.sendInvoiceToClient(
            invoiceWithRelations,
            pdfBuffer
          );
        }
      } catch (error) {
        console.error("Failed to send invoice email:", error);
        // Don't throw error to avoid failing the update operation
      }
    }

    return updatedInvoice;
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

    // Translation object for PDF text
    const translations = {
      en: {
        invoice: "INVOICE",
        proformaInvoice: "PROFORMA INVOICE",
        logo: "LOGO",
        from: "From:",
        to: "To:",
        taxpayerNumber: "Taxpayer number:",
        phoneNumber: "Phone number:",
        invoiceNumber: "Invoice Number:",
        invoiceDate: "Invoice Date:",
        serviceDetails: "Service Details",
        items: "Items",
        qty: "Qty",
        unitPrice: "Unit price",
        amount: "Amount",
        subtotal: "Subtotal",
        tva: "TVA",
        ir: "IR",
        total: "TOTAL",
        totalInWords: "Total amount in letters",
        approvedText: "Approved on this invoice the sum of:",
        taxpayerNo: "Taxpayer No:",
        thankYou: "Thank you for your business!",
      },
      fr: {
        invoice: "FACTURE",
        proformaInvoice: "FACTURE PROFORMA",
        logo: "LOGO",
        from: "De:",
        to: "À:",
        taxpayerNumber: "Numéro de contribuable:",
        phoneNumber: "Numéro de téléphone:",
        invoiceNumber: "Numéro de facture:",
        invoiceDate: "Date de facture:",
        serviceDetails: "Détails du service",
        items: "Articles",
        qty: "Qté",
        unitPrice: "Prix unitaire",
        amount: "Montant",
        subtotal: "Sous-total",
        tva: "TVA",
        ir: "IR",
        total: "TOTAL",
        totalInWords: "Montant total en lettres",
        approvedText: "Approuvé sur cette facture la somme de:",
        taxpayerNo: "N° contribuable:",
        thankYou: "Merci pour votre confiance!",
      },
    };
    const t =
      translations[user.language as keyof typeof translations] ||
      translations.en;

    // Create PDF with professional settings
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      bufferPages: true,
      info: {
        Title: `${
          invoice.type === InvoiceType.PROFORMA ? t.proformaInvoice : t.invoice
        } ${invoice.invoiceNumber}`,
        Author: user.companyName || `${user.firstName} ${user.lastName}`,
        Subject: `${
          invoice.type === InvoiceType.PROFORMA ? t.proformaInvoice : t.invoice
        } for ${invoice.client.name}`,
        Keywords: "invoice, bill, payment",
        CreationDate: new Date(),
      },
    });

    const buffers: Buffer[] = [];

    return new Promise(async (resolve, reject) => {
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

      const formatCurrency = (amount: number) => {
        const currency = user.currency || "XAF";

        // Use the same formatting logic as the frontend
        const CURRENCY_SYMBOLS: Record<string, string> = {
          USD: "$",
          EUR: "€",
          XAF: "F CFA",
        };

        const symbol = CURRENCY_SYMBOLS[currency] || currency;

        // Format the number with 2 decimal places
        const formattedAmount = amount.toFixed(2);

        // Remove .00 if it's a whole number
        const displayAmount = formattedAmount.endsWith(".00")
          ? formattedAmount.slice(0, -3)
          : formattedAmount;

        // Add spaces every 3 digits before the decimal point
        const [integerPart, decimalPart] = displayAmount.split(".");
        const formattedInteger = integerPart.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          " "
        );

        // Reconstruct the number
        const finalAmount = decimalPart
          ? `${formattedInteger}.${decimalPart}`
          : formattedInteger;

        return `${finalAmount} ${symbol}`;
      };

      const formatDate = (date: Date) => {
        return date.toLocaleDateString(user.language || "en", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

      let yPosition = 50;

      // ===== HEADER SECTION =====
      // Invoice title
      doc.fillColor(colors.primary).fontSize(28).font("Helvetica-Bold");
      doc.text(t.invoice, 50, yPosition);

      // Logo section
      if (user.companyLogo) {
        // Try to embed company logo (no background)
        try {
          const logoBuffer = await this.fetchImageFromUrl(user.companyLogo);
          // Calculate dimensions to fit within 120x50px area
          const logoWidth = 120;
          const logoHeight = 50;
          const logoX = 420; // Position on the right side
          const logoY = yPosition; // Align with title at yPosition (50)

          doc.image(logoBuffer, logoX, logoY, {
            width: logoWidth,
            height: logoHeight,
            fit: [logoWidth, logoHeight],
          });
        } catch (error) {
          // Fallback to text if image loading fails
          doc.fillColor(colors.primary).fontSize(16).font("Helvetica-Bold");
          doc.text(t.logo, 450, yPosition + 17);
        }
      } else {
        // Logo placeholder (no background)
        doc.fillColor(colors.primary).fontSize(16).font("Helvetica-Bold");
        doc.text(t.logo, 450, yPosition + 17);
      }

      yPosition = 140; // Start FROM section after invoice details

      // ===== FROM SECTION (LEFT TOP) =====
      doc.fillColor(colors.dark).fontSize(12).font("Helvetica-Bold");
      doc.text(t.from, 50, yPosition);
      yPosition += 20;

      // Issuer details (left aligned)
      doc.fillColor(colors.secondary).fontSize(10).font("Helvetica");

      // Company name or individual name
      const issuerName =
        user.companyName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim();
      if (issuerName) {
        doc.text(issuerName, 50, yPosition);
        yPosition += 15;
      }

      // Address information
      const fullAddress = [user.address, user.town, user.poBox]
        .filter(Boolean)
        .join(", ");

      if (fullAddress) {
        doc.text(fullAddress, 50, yPosition);
        yPosition += 15;
      }

      // Taxpayer number
      if (user.taxpayerNumber) {
        doc.text(`${t.taxpayerNumber} ${user.taxpayerNumber}`, 50, yPosition);
        yPosition += 15;
      }

      // Commercial register
      if (user.commercialRegister) {
        doc.text(
          `Commercial Register: ${user.commercialRegister}`,
          50,
          yPosition
        );
        yPosition += 15;
      }

      // Phone number
      if (user.phone) {
        doc.text(`${t.phoneNumber} ${user.phone}`, 50, yPosition);
        yPosition += 15;
      }

      // Email
      if (user.email) {
        doc.text(user.email, 50, yPosition);
        yPosition += 15;
      }

      yPosition += 20; // Space before TO section

      // ===== TO SECTION (RIGHT) =====
      const toSectionX = 300; // Position on the right side
      let toYPosition = 140; // Start from same Y as FROM section

      doc.fillColor(colors.dark).fontSize(12).font("Helvetica-Bold");
      doc.text(t.to, toSectionX, toYPosition);
      toYPosition += 20;

      // Client details (right aligned)
      doc.fillColor(colors.secondary).fontSize(10).font("Helvetica");
      const clientName = `${invoice.client.name}`;
      doc.text(clientName, toSectionX, toYPosition);
      toYPosition += 15;

      const companyName = invoice.client.companyName || "";
      if (companyName) {
        doc.text(companyName, toSectionX, toYPosition);
        toYPosition += 15;
      }

      const address = invoice.client.address || "";
      if (address) {
        doc.text(address, toSectionX, toYPosition);
        toYPosition += 15;
      }

      const taxpayer = invoice.client.taxpayerNumber || "";
      if (taxpayer) {
        doc.text(`${t.taxpayerNumber} ${taxpayer}`, toSectionX, toYPosition);
        toYPosition += 15;
      }

      const phone = invoice.client.phone || "";
      if (phone) {
        doc.text(`${t.phoneNumber} ${phone}`, toSectionX, toYPosition);
        toYPosition += 15;
      }

      doc.text(invoice.client.email || "", toSectionX, toYPosition);
      // No need to update yPosition here as we're done with TO section

      // ===== INVOICE NUMBER AND DATE (BELOW TITLE) =====
      doc.fillColor(colors.dark).fontSize(10).font("Helvetica-Bold");
      doc.text(`${t.invoiceNumber} ${invoice.invoiceNumber}`, 50, 90);
      doc.text(
        `${t.invoiceDate} ${formatDate(new Date(invoice.issueDate))}`,
        50,
        80
      );

      // ===== SERVICE DETAILS TABLE =====
      yPosition = 240; // Reset to after header
      doc.fillColor(colors.dark).fontSize(16).font("Helvetica-Bold");
      doc.text(t.serviceDetails, 50, yPosition);
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
      doc.text(t.items, tableX + 10, yPosition + 7, { width: 220 });
      doc.text(t.qty, tableX + 240, yPosition + 7);
      doc.text(t.unitPrice, tableX + 280, yPosition + 7);
      doc.text(t.amount, tableX + 380, yPosition + 7);

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
          width: 220,
        });

        doc.text(item.quantity.toString(), tableX + 240, yPosition + 5);
        doc.text(
          formatCurrency(parseFloat(item.unitPrice.toString())),
          tableX + 280,
          yPosition + 5
        );
        doc.text(
          formatCurrency(parseFloat(item.amount.toString())),
          tableX + 380,
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
      const totalsX = 330; // Adjusted to align amounts with item amount column
      const totalsLabelWidth = 100;
      const totalsAmountX = 450; // Align with amount column (tableX + 400)

      doc.fillColor(colors.secondary).fontSize(10).font("Helvetica");
      doc.text(t.subtotal, totalsX, totalsStartY);
      doc.fillColor(colors.dark).font("Helvetica-Bold");
      doc.text(
        formatCurrency(parseFloat(invoice.subtotal.toString())),
        totalsAmountX,
        totalsStartY,
        { align: "left", width: 100 }
      );

      let totalsY = totalsStartY + 20;

      if (invoice.tvaEnabled) {
        doc.fillColor(colors.secondary).font("Helvetica");
        doc.text(`${t.tva} (${invoice.tvaRate}%)`, totalsX, totalsY);
        doc.fillColor(colors.dark).font("Helvetica-Bold");
        doc.text(
          formatCurrency(parseFloat(invoice.tvaAmount.toString())),
          totalsAmountX,
          totalsY,
          { align: "left", width: 100 }
        );
        totalsY += 20;
      }

      if (invoice.irEnabled) {
        doc.fillColor(colors.secondary).font("Helvetica");
        doc.text(`${t.ir} (${invoice.irRate}%)`, totalsX, totalsY);
        doc.fillColor(colors.dark).font("Helvetica-Bold");
        doc.text(
          formatCurrency(parseFloat(invoice.irAmount.toString())),
          totalsAmountX,
          totalsY,
          { align: "left", width: 100 }
        );
        totalsY += 20;
      }

      // Total
      doc.fillColor(colors.primary).fontSize(12).font("Helvetica-Bold");
      doc.text(t.total, totalsX, totalsY);
      doc.text(
        formatCurrency(parseFloat(invoice.total.toString())),
        totalsAmountX,
        totalsY,
        { align: "left", width: 100 }
      );

      yPosition = totalsY + 40;

      // ===== APPROVAL TEXT =====
      doc.fillColor(colors.muted).fontSize(10).font("Helvetica-Oblique");
      const totalInWords = t.totalInWords; // Placeholder - implement number to words if needed
      doc.text(`${t.approvedText} ${totalInWords}`, 50, yPosition);
      yPosition += 30;

      // ===== FOOTER SECTION =====
      // Draw a line above the footer
      doc
        .moveTo(50, doc.page.height - 70)
        .lineTo(doc.page.width - 50, doc.page.height - 70)
        .strokeColor(colors.border)
        .lineWidth(1)
        .stroke();

      // Footer text (centered)
      doc.fontSize(10).fillColor(colors.muted).font("Helvetica");
      const footerText = user.companyName
        ? `${user.companyName} | ${user.email} | ${
            user.phone ? " | " + user.phone : ""
          }`
        : `${user.firstName} ${user.lastName} | ${user.email}, ${
            user.phone ? " | " + user.phone : ""
          }`;

      doc.text(footerText, 50, doc.page.height - 55, {
        align: "center",
        width: doc.page.width - 100,
      });

      doc.end();
    });
  }
}
