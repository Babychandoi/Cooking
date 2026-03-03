import { CreateDishDto } from '../dto/request/create-dish.dto.js';
import { UpdateDishDto } from '../dto/request/update-dish.dto.js';
import { DishResponseDto } from '../dto/response/dish-response.dto.js';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

export interface DishService {
  findAll(): Promise<DishResponseDto[]>;
  findPaginated(page: number, limit: number, search?: string): Promise<PaginatedResponse<DishResponseDto>>;
  findById(id: string): Promise<DishResponseDto>;
  create(dto: CreateDishDto): Promise<DishResponseDto>;
  update(id: string, dto: UpdateDishDto): Promise<DishResponseDto>;
  delete(id: string): Promise<void>;
}

export const DISH_SERVICE = 'DISH_SERVICE';
