import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Table } from '../../table/entity/table.entity.js';
import { Order } from '../../order/entity/order.entity.js';
import { Invoice } from '../../invoice/entity/invoice.entity.js';

@Entity('table_sessions')
export class TableSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Table, (table) => table.sessions)
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @Column({ name: 'table_id' })
  tableId: string;

  @CreateDateColumn({ name: 'opened_at' })
  openedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @Column({ length: 20, default: 'open' })
  status: string; // open, closed, paid

  @OneToMany(() => Order, (order) => order.tableSession)
  orders: Order[];

  @OneToMany(() => Invoice, (invoice) => invoice.tableSession)
  invoices: Invoice[];
}
