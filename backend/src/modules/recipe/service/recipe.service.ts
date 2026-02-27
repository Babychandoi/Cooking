import { CreateRecipeDto } from '../dto/request/create-recipe.dto.js';
import { UpdateRecipeDto } from '../dto/request/update-recipe.dto.js';
import { RecipeResponseDto } from '../dto/response/recipe-response.dto.js';

export interface RecipeService {
  findAll(): Promise<RecipeResponseDto[]>;
  findById(id: number): Promise<RecipeResponseDto>;
  findActiveByDishId(dishId: number): Promise<RecipeResponseDto>;
  create(dto: CreateRecipeDto): Promise<RecipeResponseDto>;
  update(id: number, dto: UpdateRecipeDto): Promise<RecipeResponseDto>;
  activate(id: number): Promise<RecipeResponseDto>;
}

export const RECIPE_SERVICE = 'RECIPE_SERVICE';
