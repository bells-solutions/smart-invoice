import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Invoice, InvoiceStatus } from "../invoices/invoice.entity";
import { User } from "../users/user.entity";
import { MailService } from "../mail/mail.service";

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService
  ) {}

  // Run on the 1st day of each month at 9:00 AM
  @Cron("0 9 1 * *")
  async sendMonthlySummaries() {
    this.logger.log("Starting monthly summary generation...");

    try {
      const users = await this.usersRepository.find();

      for (const user of users) {
        try {
          const summaryData = await this.generateMonthlySummary(user.id);

          // Only send if user has invoices
          if (summaryData.totalInvoices > 0) {
            await this.mailService.sendMonthlySummary(user, summaryData);
            this.logger.log(`Monthly summary sent to user: ${user.email}`);
          }
        } catch (error) {
          this.logger.error(
            `Failed to send monthly summary to ${user.email}:`,
            error
          );
        }
      }

      this.logger.log("Monthly summary generation completed");
    } catch (error) {
      this.logger.error("Error in monthly summary job:", error);
    }
  }

  async generateMonthlySummary(userId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all invoices for the user in the current month
    const invoices = await this.invoicesRepository
      .createQueryBuilder("invoice")
      .where("invoice.userId = :userId", { userId })
      .andWhere("invoice.createdAt >= :startDate", {
        startDate: firstDayOfMonth,
      })
      .andWhere("invoice.createdAt <= :endDate", { endDate: lastDayOfMonth })
      .getMany();

    // Calculate totals
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0
    );

    // Paid invoices
    const paidInvoices = invoices.filter(
      (inv) => inv.status === InvoiceStatus.PAID
    );
    const paidCount = paidInvoices.length;
    const paidAmount = paidInvoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0
    );

    // Overdue invoices
    const overdueInvoices = invoices.filter(
      (inv) =>
        inv.status === InvoiceStatus.OVERDUE ||
        (inv.status === InvoiceStatus.SENT && new Date(inv.dueDate) < now)
    );
    const overdueCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0
    );

    // Pending invoices (sent but not overdue)
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === InvoiceStatus.SENT && new Date(inv.dueDate) >= now
    );
    const pendingCount = pendingInvoices.length;
    const pendingAmount = pendingInvoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0
    );

    return {
      totalInvoices,
      totalAmount: totalAmount.toFixed(2),
      paidInvoices: paidCount,
      paidAmount: paidAmount.toFixed(2),
      overdueInvoices: overdueCount,
      overdueAmount: overdueAmount.toFixed(2),
      pendingInvoices: pendingCount,
      pendingAmount: pendingAmount.toFixed(2),
    };
  }

  // Manual method to generate summary for a specific user
  async generateAndSendSummary(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const summaryData = await this.generateMonthlySummary(userId);

    if (summaryData.totalInvoices === 0) {
      return { message: "No invoices found for this month" };
    }

    await this.mailService.sendMonthlySummary(user, summaryData);
    this.logger.log(`Manual monthly summary sent to user: ${user.email}`);

    return { message: "Monthly summary sent successfully", data: summaryData };
  }

  // Get dashboard statistics for a user
  async getDashboardStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Monthly stats
    const monthlyStats = await this.generateMonthlySummary(userId);

    // Yearly stats
    const yearlyInvoices = await this.invoicesRepository
      .createQueryBuilder("invoice")
      .where("invoice.userId = :userId", { userId })
      .andWhere("invoice.createdAt >= :startDate", { startDate: startOfYear })
      .getMany();

    const yearlyTotal = yearlyInvoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0
    );
    const yearlyPaid = yearlyInvoices
      .filter((inv) => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentInvoices = await this.invoicesRepository
      .createQueryBuilder("invoice")
      .where("invoice.userId = :userId", { userId })
      .andWhere("invoice.createdAt >= :startDate", { startDate: thirtyDaysAgo })
      .orderBy("invoice.createdAt", "DESC")
      .limit(5)
      .getMany();

    return {
      monthly: monthlyStats,
      yearly: {
        totalInvoices: yearlyInvoices.length,
        totalAmount: yearlyTotal.toFixed(2),
        paidAmount: yearlyPaid.toFixed(2),
      },
      recent: recentInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        status: inv.status,
        total: inv.total,
        createdAt: inv.createdAt,
      })),
    };
  }
}
