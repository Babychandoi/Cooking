import { RestaurantChain } from '../entity/restaurant-chain.entity.js';
import { RestaurantChainResponseDto } from '../dto/response/restaurant-chain-response.dto.js';

export class RestaurantChainMapper {
  static toDto(entity: RestaurantChain): RestaurantChainResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }

  static toDtoList(entities: RestaurantChain[]): RestaurantChainResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
