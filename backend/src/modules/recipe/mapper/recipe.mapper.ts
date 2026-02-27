import { Recipe } from '../entity/recipe.entity.js';
import { RecipeResponseDto } from '../dto/response/recipe-response.dto.js';
import { RecipeItemResponseDto } from '../dto/response/recipe-item-response.dto.js';
import { RecipeItem } from '../entity/recipe-item.entity.js';

export class RecipeMapper {
  static toResponse(entity: Recipe): RecipeResponseDto {
    const dto = new RecipeResponseDto();
    dto.id = entity.id;
    dto.dishId = entity.dishId;
    dto.dishName = entity.dish?.name || '';
    dto.version = entity.version;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.items = entity.items
      ? entity.items.map((item) => this.toItemResponse(item))
      : [];
    return dto;
  }

  static toItemResponse(item: RecipeItem): RecipeItemResponseDto {
    const dto = new RecipeItemResponseDto();
    dto.id = item.id;
    dto.ingredientId = item.ingredientId;
    dto.ingredientName = item.ingredient?.name || '';
    dto.quantity = Number(item.quantity);
    dto.unit = item.unit;
    return dto;
  }

  static toResponseList(entities: Recipe[]): RecipeResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
