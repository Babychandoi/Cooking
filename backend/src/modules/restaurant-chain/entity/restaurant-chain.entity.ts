import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Branch } from '../../branch/entity/branch.entity.js';

@Entity('restaurant_chains')
export class RestaurantChain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Branch, (branch) => branch.chain)
  branches: Branch[];
}
