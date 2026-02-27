import { RecipeItemResponseDto } from './recipe-item-response.dto.js';

export class RecipeResponseDto {
  id: number;
  dishId: number;
  dishName: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  items: RecipeItemResponseDto[];
}
