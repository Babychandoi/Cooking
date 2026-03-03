import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RestaurantChain } from '../../restaurant-chain/entity/restaurant-chain.entity.js';
import { Table } from '../../table/entity/table.entity.js';
import { BranchDish } from '../../branch-dish/entity/branch-dish.entity.js';
import { BranchIngredient } from '../../branch-ingredient/entity/branch-ingredient.entity.js';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RestaurantChain, (chain) => chain.branches)
  @JoinColumn({ name: 'chain_id' })
  chain: RestaurantChain;

  @Column({ name: 'chain_id' })
  chainId: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Table, (table) => table.branch)
  tables: Table[];

  @OneToMany(() => BranchDish, (bd) => bd.branch)
  branchDishes: BranchDish[];

  @OneToMany(() => BranchIngredient, (bi) => bi.branch)
  branchIngredients: BranchIngredient[];
}
