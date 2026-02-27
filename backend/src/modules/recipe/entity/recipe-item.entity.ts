import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Recipe } from './recipe.entity.js';
import { Ingredient } from '../../ingredient/entity/ingredient.entity.js';

@Entity('recipe_items')
export class RecipeItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @Column({ name: 'recipe_id' })
  recipeId: number;

  @ManyToOne(() => Ingredient, { eager: true })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ name: 'ingredient_id' })
  ingredientId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ length: 20 })
  unit: string;
}
