import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { MailService } from "./mail.service";
// import { MailController } from "./mail.controller"; // Mail functionality disabled

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const port = parseInt(configService.get("MAIL_PORT") || "587", 10);
        const secure = port === 465; // Port 465 uses SSL, port 587 uses TLS

        return {
          transport: {
            host: configService.get("MAIL_HOST"),
            port: port,
            secure: secure,
            auth: {
              user: configService.get("MAIL_USER"),
              pass: configService.get("MAIL_PASS"),
            },
            // For TLS (port 587)
            ...(port === 587 && {
              tls: {
                rejectUnauthorized: false, // Set to true in production with valid certificates
              },
            }),
          },
        defaults: {
          from: `"Smart Invoice" <${configService.get("MAIL_FROM")}>`,
        },
        template: {
          dir: join(__dirname, "..", "..", "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        };
      },
      inject: [ConfigService],
    }),
  ],
  // controllers: [MailController], // Mail functionality disabled
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
