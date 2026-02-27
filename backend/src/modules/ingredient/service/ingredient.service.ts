import { CreateIngredientDto } from '../dto/request/create-ingredient.dto.js';
import { UpdateIngredientDto } from '../dto/request/update-ingredient.dto.js';
import { IngredientResponseDto } from '../dto/response/ingredient-response.dto.js';

export interface IngredientService {
  findAll(): Promise<IngredientResponseDto[]>;
  findById(id: number): Promise<IngredientResponseDto>;
  create(dto: CreateIngredientDto): Promise<IngredientResponseDto>;
  update(id: number, dto: UpdateIngredientDto): Promise<IngredientResponseDto>;
  restock(id: number, quantity: number): Promise<IngredientResponseDto>;
  delete(id: number): Promise<void>;
}

export const INGREDIENT_SERVICE = 'INGREDIENT_SERVICE';
