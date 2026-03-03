import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Branch } from '../../branch/entity/branch.entity.js';
import { Dish } from '../../dish/entity/dish.entity.js';

@Entity('branch_dishes')
export class BranchDish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (branch) => branch.branchDishes)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id' })
  branchId: string;

  @ManyToOne(() => Dish)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @Column({ name: 'dish_id' })
  dishId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ length: 20, default: 'active' })
  status: string;
}
