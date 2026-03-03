import { RestaurantChainResponseDto } from '../dto/response/restaurant-chain-response.dto.js';
import { CreateRestaurantChainDto } from '../dto/request/create-restaurant-chain.dto.js';
import { UpdateRestaurantChainDto } from '../dto/request/update-restaurant-chain.dto.js';

export interface RestaurantChainService {
  findAll(): Promise<RestaurantChainResponseDto[]>;
  findById(id: string): Promise<RestaurantChainResponseDto>;
  create(dto: CreateRestaurantChainDto): Promise<RestaurantChainResponseDto>;
  update(id: string, dto: UpdateRestaurantChainDto): Promise<RestaurantChainResponseDto>;
  delete(id: string): Promise<void>;
}

export const RESTAURANT_CHAIN_SERVICE = 'RESTAURANT_CHAIN_SERVICE';
