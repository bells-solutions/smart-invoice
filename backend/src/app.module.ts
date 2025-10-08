import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ClientsModule } from "./clients/clients.module";
import { InvoicesModule } from "./invoices/invoices.module";
import { UploadModule } from "./upload/upload.module";
import { User } from "./users/user.entity";
import { Client } from "./clients/client.entity";
import { Invoice } from "./invoices/invoice.entity";
import { InvoiceItem } from "./invoices/invoice-item.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get("DB_PORT", 5432),
        username: configService.get("DB_USERNAME", "postgres"),
        password: configService.get("DB_PASSWORD", "postgres"),
        database: configService.get("DB_DATABASE", "smartinvoice"),
        entities: [User, Client, Invoice, InvoiceItem],
        synchronize: configService.get("NODE_ENV") !== "production",
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    InvoicesModule,
    UploadModule,
  ],
})
export class AppModule {}
