import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Branch } from '../../branch/entity/branch.entity.js';
import { TableSession } from '../../table-session/entity/table-session.entity.js';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (branch) => branch.tables)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id' })
  branchId: string;

  @Column({ name: 'table_code', length: 20 })
  tableCode: string;

  @Column({ default: 4 })
  capacity: number;

  @Column({ length: 20, default: 'available' })
  status: string; // available, occupied, reserved

  @OneToMany(() => TableSession, (session) => session.table)
  sessions: TableSession[];
}
