import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { InvoicesService } from "./invoices.service";
import { ReportsService } from "./reports.service";
import { CreateInvoiceDto, UpdateInvoiceDto } from "./invoice.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { User } from "../users/user.entity";

@Controller("invoices")
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(
    private invoicesService: InvoicesService,
    private reportsService: ReportsService
  ) {}

  @Post()
  create(
    @Body(ValidationPipe) createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user: User
  ) {
    return this.invoicesService.create(createInvoiceDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.invoicesService.findAll(user);
  }

  @Get("dashboard/stats")
  getDashboardStats(@CurrentUser() user: User) {
    return this.invoicesService.getDashboardStats(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: User) {
    return this.invoicesService.findOne(id, user);
  }

  @Get(":id/pdf")
  async downloadPDF(
    @Param("id") id: string,
    @CurrentUser() user: User,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.invoicesService.generatePDF(id, user);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${id}.pdf`,
      "Content-Length": pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body(ValidationPipe) updateInvoiceDto: UpdateInvoiceDto,
    @CurrentUser() user: User
  ) {
    return this.invoicesService.update(id, updateInvoiceDto, user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.invoicesService.remove(id, user);
  }

  @Post(":id/send-email")
  sendEmail(@Param("id") id: string, @CurrentUser() user: User) {
    return this.invoicesService.sendInvoiceEmail(id, user);
  }

  @Post(":id/send-reminder")
  sendReminder(@Param("id") id: string, @CurrentUser() user: User) {
    return this.invoicesService.sendPaymentReminder(id, user);
  }

  @Get("overdue")
  getOverdueInvoices(@CurrentUser() user: User) {
    return this.invoicesService.getOverdueInvoices(user);
  }

  @Get("monthly-summary")
  getMonthlySummary(@CurrentUser() user: User) {
    return this.reportsService.generateMonthlySummary(user.id);
  }

  @Post("generate-monthly-summary")
  generateMonthlySummary(@CurrentUser() user: User) {
    return this.reportsService.generateAndSendSummary(user.id);
  }
}
