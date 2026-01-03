import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { Invoice } from "../invoices/invoice.entity";
import { User } from "../users/user.entity";
import { Client } from "../clients/client.entity";

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {}

  async sendInvoiceToClient(invoice: Invoice, attachmentBuffer?: Buffer) {
    const subject = `Invoice ${invoice.invoiceNumber} from ${invoice.user.firstName} ${invoice.user.lastName}`;

    await this.mailerService.sendMail({
      to: invoice.client.email,
      subject,
      template: "invoice-delivery",
      context: {
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        total: invoice.total,
        userFirstName: invoice.user.firstName,
        userLastName: invoice.user.lastName,
        userEmail: invoice.user.email,
        companyName: invoice.user.companyName,
        notes: invoice.notes,
      },
      attachments: attachmentBuffer
        ? [
            {
              filename: `invoice-${invoice.invoiceNumber}.pdf`,
              content: attachmentBuffer,
              contentType: "application/pdf",
            },
          ]
        : undefined,
    });
  }

  async sendPaymentReminder(invoice: Invoice) {
    const daysOverdue = Math.floor(
      (new Date().getTime() - new Date(invoice.dueDate).getTime()) /
        (1000 * 3600 * 24)
    );

    await this.mailerService.sendMail({
      to: invoice.client.email,
      subject: `Payment Reminder: Invoice ${invoice.invoiceNumber} - ${daysOverdue} days overdue`,
      template: "payment-reminder",
      context: {
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        total: invoice.total,
        daysOverdue,
        userFirstName: invoice.user.firstName,
        userLastName: invoice.user.lastName,
        userEmail: invoice.user.email,
        companyName: invoice.user.companyName,
      },
    });
  }

  async sendPasswordResetEmail(user: User, resetToken: string) {
    const resetUrl = `${this.configService.get(
      "FRONTEND_URL"
    )}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      template: "password-reset",
      context: {
        firstName: user.firstName,
        resetUrl,
        expirationTime: "1 hour",
      },
    });
  }

  async sendEmailVerification(user: User, verificationToken: string) {
    const verificationUrl = `${this.configService.get(
      "FRONTEND_URL"
    )}/verify-email?token=${verificationToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: "Please verify your email address",
      template: "email-verification",
      context: {
        firstName: user.firstName,
        verificationUrl,
      },
    });
  }

  async sendMonthlySummary(user: User, summaryData: any) {
    const subject = `Monthly Invoice Summary - ${new Date().toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric" }
    )}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject,
      template: "monthly-summary",
      context: {
        firstName: user.firstName,
        month: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        totalInvoices: summaryData.totalInvoices,
        totalAmount: summaryData.totalAmount,
        paidInvoices: summaryData.paidInvoices,
        paidAmount: summaryData.paidAmount,
        overdueInvoices: summaryData.overdueInvoices,
        overdueAmount: summaryData.overdueAmount,
        pendingInvoices: summaryData.pendingInvoices,
        pendingAmount: summaryData.pendingAmount,
        companyName: user.companyName,
      },
    });
  }

  async sendWelcomeEmail(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: "Welcome to Smart Invoice!",
      template: "welcome",
      context: {
        firstName: user.firstName,
        email: user.email,
        loginUrl: `${this.configService.get("FRONTEND_URL")}/login`,
      },
    });
  }
}
