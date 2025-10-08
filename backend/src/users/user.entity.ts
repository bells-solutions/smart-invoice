import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Client } from "../clients/client.entity";
import { Invoice } from "../invoices/invoice.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: ["individual", "company"],
    default: "individual",
  })
  accountType: "individual" | "company";

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  town: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  taxpayerNumber: string;

  @Column({ nullable: true })
  commercialRegister: string;

  @Column({ nullable: true })
  poBox: string;

  @Column({ nullable: true })
  companyLogo: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true, default: "XAF" })
  currency?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Client, (client) => client.user)
  clients: Client[];

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  invoices: Invoice[];
}
