import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity.js';
import { Ingredient } from '../../ingredient/entity/ingredient.entity.js';

@Entity('order_item_ingredients')
export class OrderItemIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderItem, (oi) => oi.ingredients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ name: 'order_item_id' })
  orderItemId: number;

  @ManyToOne(() => Ingredient, { eager: true })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ name: 'ingredient_id' })
  ingredientId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ length: 20 })
  unit: string;

  @Column({ default: false })
  isRestored: boolean;
}
