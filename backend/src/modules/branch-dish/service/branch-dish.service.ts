import { BranchDishResponseDto } from '../dto/response/branch-dish-response.dto.js';
import { CreateBranchDishDto } from '../dto/request/create-branch-dish.dto.js';
import { UpdateBranchDishDto } from '../dto/request/update-branch-dish.dto.js';

export interface BranchDishService {
  findAll(): Promise<BranchDishResponseDto[]>;
  findById(id: string): Promise<BranchDishResponseDto>;
  findByBranch(branchId: string): Promise<BranchDishResponseDto[]>;
  findByDish(dishId: string): Promise<BranchDishResponseDto[]>;
  create(dto: CreateBranchDishDto): Promise<BranchDishResponseDto>;
  update(id: string, dto: UpdateBranchDishDto): Promise<BranchDishResponseDto>;
  updatePrice(branchId: string, dishId: string, price: number): Promise<BranchDishResponseDto>;
  updateAvailability(branchId: string, dishId: string, isAvailable: boolean): Promise<BranchDishResponseDto>;
  delete(id: string): Promise<void>;
}

export const BRANCH_DISH_SERVICE = 'BRANCH_DISH_SERVICE';
