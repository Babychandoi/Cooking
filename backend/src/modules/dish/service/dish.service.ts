import { CreateDishDto } from '../dto/request/create-dish.dto.js';
import { UpdateDishDto } from '../dto/request/update-dish.dto.js';
import { DishResponseDto } from '../dto/response/dish-response.dto.js';

export interface DishService {
  findAll(): Promise<DishResponseDto[]>;
  findById(id: number): Promise<DishResponseDto>;
  create(dto: CreateDishDto): Promise<DishResponseDto>;
  update(id: number, dto: UpdateDishDto): Promise<DishResponseDto>;
  delete(id: number): Promise<void>;
}

export const DISH_SERVICE = 'DISH_SERVICE';
