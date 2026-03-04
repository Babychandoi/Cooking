import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { TableSession } from '../../table-session/entity/table-session.entity.js';
import { Payment } from '../../payment/entity/payment.entity.js';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TableSession, (session) => session.invoices)
  @JoinColumn({ name: 'table_session_id' })
  tableSession: TableSession;

  @Column({ name: 'table_session_id' })
  tableSessionId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({ length: 20, default: 'pending' })
  status: string; // pending, paid, cancelled

  @CreateDateColumn({ name: 'issued_at' })
  issuedAt: Date;

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];
}
