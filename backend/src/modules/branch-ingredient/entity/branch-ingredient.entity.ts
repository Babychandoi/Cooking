import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Branch } from '../../branch/entity/branch.entity.js';
import { Ingredient } from '../../ingredient/entity/ingredient.entity.js';

@Entity('branch_ingredients')
export class BranchIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (branch) => branch.branchIngredients)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'branch_id' })
  branchId: string;

  @ManyToOne(() => Ingredient, { eager: true })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ name: 'ingredient_id' })
  ingredientId: string;

  @Column({ name: 'stock_quantity', type: 'decimal', precision: 10, scale: 2, default: 0 })
  stockQuantity: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
