import { BranchDish } from '../entity/branch-dish.entity.js';
import { BranchDishResponseDto } from '../dto/response/branch-dish-response.dto.js';

export class BranchDishMapper {
  static toDto(entity: BranchDish): BranchDishResponseDto {
    return {
      id: entity.id,
      branchId: entity.branchId,
      branchName: entity.branch?.name,
      dishId: entity.dishId,
      dishName: entity.dish?.name,
      price: entity.price,
      isAvailable: entity.isAvailable,
      status: entity.status,
    };
  }

  static toDtoList(entities: BranchDish[]): BranchDishResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
