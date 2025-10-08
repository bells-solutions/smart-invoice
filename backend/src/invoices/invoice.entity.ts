import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "../users/user.entity";
import { Client } from "../clients/client.entity";
import { InvoiceItem } from "./invoice-item.entity";

export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid",
  OVERDUE = "overdue",
}

export enum InvoiceType {
  NORMAL = "normal",
  PROFORMA = "proforma",
}

@Entity("invoices")
export class Invoice {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  invoiceNumber: string;

  @Column({
    type: "enum",
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({
    type: "enum",
    enum: InvoiceType,
    default: InvoiceType.NORMAL,
  })
  type: InvoiceType;

  @Column({ type: "date" })
  issueDate: Date;

  @Column({ type: "date" })
  dueDate: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: "boolean", default: false })
  tvaEnabled: boolean;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 19.25 })
  tvaRate: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  tvaAmount: number;

  @Column({ type: "boolean", default: false })
  irEnabled: boolean;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 5.5 })
  irRate: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  irAmount: number;

  @Column({ type: "boolean", default: false })
  discountEnabled: boolean;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  discountRate: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: "text", nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.invoices, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Client, (client) => client.invoices, { onDelete: "CASCADE" })
  client: Client;

  @Column()
  clientId: string;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];
}
