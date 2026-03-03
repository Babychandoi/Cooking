import { CreateRecipeDto } from '../dto/request/create-recipe.dto.js';
import { UpdateRecipeDto } from '../dto/request/update-recipe.dto.js';
import { RecipeResponseDto } from '../dto/response/recipe-response.dto.js';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

export interface RecipeService {
  findAll(): Promise<RecipeResponseDto[]>;
  findPaginated(page: number, limit: number, search?: string): Promise<PaginatedResponse<RecipeResponseDto>>;
  findById(id: string): Promise<RecipeResponseDto>;
  findActiveByDishId(dishId: string): Promise<RecipeResponseDto>;
  create(dto: CreateRecipeDto): Promise<RecipeResponseDto>;
  update(id: string, dto: UpdateRecipeDto): Promise<RecipeResponseDto>;
  activate(id: string): Promise<RecipeResponseDto>;
  delete(id: string): Promise<void>;
}

export const RECIPE_SERVICE = 'RECIPE_SERVICE';
