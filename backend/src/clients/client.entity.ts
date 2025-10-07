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
import { Invoice } from "../invoices/invoice.entity";

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({
    type: "enum",
    enum: ["individual", "company"],
    default: "individual",
  })
  clientType: "individual" | "company";

  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  taxpayerNumber?: string;

  @Column({ nullable: true })
  commercialRegister?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.clients, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Invoice, (invoice) => invoice.client)
  invoices: Invoice[];
}
