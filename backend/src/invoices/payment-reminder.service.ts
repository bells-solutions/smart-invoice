import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import { Invoice, InvoiceStatus } from "../invoices/invoice.entity";

@Injectable()
export class PaymentReminderService {
  private readonly logger = new Logger(PaymentReminderService.name);

  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>
  ) {}

  // Run every day at 9:00 AM
  @Cron("0 9 * * *")
  async sendPaymentReminders() {
    this.logger.log("Starting payment reminder check...");

    try {
      // Find all overdue invoices that are in 'sent' status
      const overdueInvoices = await this.invoicesRepository.find({
        where: {
          status: InvoiceStatus.SENT,
          dueDate: LessThan(new Date()),
        },
        relations: ["user", "client"],
      });

      this.logger.log(`Found ${overdueInvoices.length} overdue invoices`);

      this.logger.log(`Found ${overdueInvoices.length} overdue invoices (email reminders disabled)`);

      this.logger.log("Payment reminder check completed");
    } catch (error) {
      this.logger.error("Error in payment reminder job:", error);
    }
  }

  // Manual method to send reminders for specific invoices
  async sendReminderForInvoice(invoiceId: string) {
    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId },
      relations: ["user", "client"],
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status !== InvoiceStatus.SENT) {
      throw new Error("Can only send reminders for sent invoices");
    }

    if (new Date(invoice.dueDate) >= new Date()) {
      throw new Error("Invoice is not overdue yet");
    }

    this.logger.log(
      `Payment reminder requested for invoice ${invoice.invoiceNumber} (email functionality disabled)`
    );
  }

  // Get overdue invoices for a specific user
  async getOverdueInvoices(userId: string) {
    return this.invoicesRepository.find({
      where: {
        userId,
        status: InvoiceStatus.SENT,
        dueDate: LessThan(new Date()),
      },
      relations: ["client"],
      order: { dueDate: "ASC" },
    });
  }

  // Update invoice status to overdue
  @Cron("0 8 * * *")
  async updateOverdueStatus() {
    this.logger.log("Updating overdue invoice statuses...");

    try {
      const result = await this.invoicesRepository
        .createQueryBuilder()
        .update(Invoice)
        .set({ status: InvoiceStatus.OVERDUE })
        .where("status = :status", { status: InvoiceStatus.SENT })
        .andWhere("dueDate < :now", { now: new Date() })
        .execute();

      this.logger.log(`Updated ${result.affected} invoices to overdue status`);
    } catch (error) {
      this.logger.error("Error updating overdue statuses:", error);
    }
  }
}
