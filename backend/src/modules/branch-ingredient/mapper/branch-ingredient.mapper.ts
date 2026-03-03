import { BranchIngredient } from '../entity/branch-ingredient.entity.js';
import { BranchIngredientResponseDto } from '../dto/response/branch-ingredient-response.dto.js';

export class BranchIngredientMapper {
  static toDto(entity: BranchIngredient): BranchIngredientResponseDto {
    return {
      id: entity.id,
      branchId: entity.branchId,
      branchName: entity.branch?.name,
      ingredientId: entity.ingredientId,
      ingredientName: entity.ingredient?.name,
      ingredientUnit: entity.ingredient?.unit,
      stockQuantity: entity.stockQuantity,
      costPrice: entity.costPrice,
      updatedAt: entity.updatedAt,
    };
  }

  static toDtoList(entities: BranchIngredient[]): BranchIngredientResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
