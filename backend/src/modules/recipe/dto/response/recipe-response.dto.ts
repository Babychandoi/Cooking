import { RecipeItemResponseDto } from './recipe-item-response.dto.js';

export class RecipeResponseDto {
  id: string;
  dishId: string;
  dishName: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  items: RecipeItemResponseDto[];
}
