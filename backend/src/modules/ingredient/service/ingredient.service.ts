import { CreateIngredientDto } from '../dto/request/create-ingredient.dto.js';
import { UpdateIngredientDto } from '../dto/request/update-ingredient.dto.js';
import { IngredientResponseDto } from '../dto/response/ingredient-response.dto.js';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

export interface IngredientService {
  findAll(): Promise<IngredientResponseDto[]>;
  findPaginated(page: number, limit: number, search?: string): Promise<PaginatedResponse<IngredientResponseDto>>;
  findById(id: string): Promise<IngredientResponseDto>;
  create(dto: CreateIngredientDto): Promise<IngredientResponseDto>;
  update(id: string, dto: UpdateIngredientDto): Promise<IngredientResponseDto>;
  restock(id: string, quantity: number): Promise<IngredientResponseDto>;
  delete(id: string): Promise<void>;
}

export const INGREDIENT_SERVICE = 'INGREDIENT_SERVICE';
