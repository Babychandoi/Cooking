import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Dish } from '../../dish/entity/dish.entity.js';
import { RecipeItem } from './recipe-item.entity.js';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dish, { eager: true })
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @Column({ name: 'dish_id' })
  dishId: string;

  @Column({ default: 1 })
  version: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => RecipeItem, (item) => item.recipe, {
    eager: true,
    cascade: true,
  })
  items: RecipeItem[];
}
