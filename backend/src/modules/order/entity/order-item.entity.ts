import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity.js';
import { Dish } from '../../dish/entity/dish.entity.js';
import { OrderItemIngredient } from './order-item-ingredient.entity.js';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Dish, { eager: true })
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @Column({ name: 'dish_id' })
  dishId: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'recipe_version' })
  recipeVersion: number;

  @OneToMany(
    () => OrderItemIngredient,
    (oii) => oii.orderItem,
    { eager: true, cascade: true },
  )
  ingredients: OrderItemIngredient[];
}
