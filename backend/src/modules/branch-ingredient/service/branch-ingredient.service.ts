import { BranchIngredientResponseDto } from '../dto/response/branch-ingredient-response.dto.js';
import { CreateBranchIngredientDto } from '../dto/request/create-branch-ingredient.dto.js';
import { UpdateBranchIngredientDto } from '../dto/request/update-branch-ingredient.dto.js';

export interface BranchIngredientService {
  findAll(): Promise<BranchIngredientResponseDto[]>;
  findById(id: string): Promise<BranchIngredientResponseDto>;
  findByBranch(branchId: string): Promise<BranchIngredientResponseDto[]>;
  findByIngredient(ingredientId: string): Promise<BranchIngredientResponseDto[]>;
  create(dto: CreateBranchIngredientDto): Promise<BranchIngredientResponseDto>;
  update(id: string, dto: UpdateBranchIngredientDto): Promise<BranchIngredientResponseDto>;
  updateStock(branchId: string, ingredientId: string, quantity: number): Promise<BranchIngredientResponseDto>;
  restock(branchId: string, ingredientId: string, quantity: number): Promise<BranchIngredientResponseDto>;
  delete(id: string): Promise<void>;
}

export const BRANCH_INGREDIENT_SERVICE = 'BRANCH_INGREDIENT_SERVICE';
