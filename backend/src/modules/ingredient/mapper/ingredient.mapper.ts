import { Ingredient } from '../entity/ingredient.entity.js';
import { IngredientResponseDto } from '../dto/response/ingredient-response.dto.js';

export class IngredientMapper {
  static toResponse(entity: Ingredient): IngredientResponseDto {
    const dto = new IngredientResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.unit = entity.unit;
    dto.stock = Number(entity.stock);
    dto.version = entity.version;
    return dto;
  }

  static toResponseList(entities: Ingredient[]): IngredientResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
