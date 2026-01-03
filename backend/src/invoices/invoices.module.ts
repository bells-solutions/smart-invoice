import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InvoicesService } from "./invoices.service";
import { InvoicesController } from "./invoices.controller";
import { PaymentReminderService } from "./payment-reminder.service";
import { ReportsService } from "./reports.service";
import { Invoice } from "./invoice.entity";
import { InvoiceItem } from "./invoice-item.entity";
import { User } from "../users/user.entity";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem, User]), MailModule],
  providers: [InvoicesService, PaymentReminderService, ReportsService],
  controllers: [InvoicesController],
  exports: [InvoicesService, PaymentReminderService, ReportsService],
})
export class InvoicesModule {}
