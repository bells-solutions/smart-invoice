import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Invoice } from "./invoice.entity";

@Entity("invoice_items")
export class InvoiceItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  description: string;

  @Column({ type: "integer" })
  quantity: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: "CASCADE" })
  invoice: Invoice;

  @Column()
  invoiceId: string;
}
