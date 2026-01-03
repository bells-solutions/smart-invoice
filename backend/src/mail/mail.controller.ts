import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { MailService } from "./mail.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post("test")
  async testEmail(@Body() body: { to: string; subject?: string; message?: string }) {
    const { to, subject = "Test Email from Smart Invoice", message = "This is a test email to verify your mail configuration is working correctly." } = body;

    if (!to) {
      return {
        success: false,
        message: "Email address (to) is required",
      };
    }

    try {
      await this.mailService.sendTestEmail(to, subject, message);
      return {
        success: true,
        message: "Test email sent successfully!",
        sentTo: to,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to send test email",
        error: error.message,
      };
    }
  }

  @Get("config")
  @UseGuards(JwtAuthGuard)
  async getMailConfig() {
    return {
      configured: true,
      host: process.env.MAIL_HOST || "Not configured",
      port: process.env.MAIL_PORT || "Not configured",
      from: process.env.MAIL_FROM || "Not configured",
      user: process.env.MAIL_USER
        ? "***@" + process.env.MAIL_USER.split("@")[1]
        : "Not configured",
      hasPassword: !!process.env.MAIL_PASS,
    };
  }
}

