import { Dish } from '../entity/dish.entity.js';
import { DishResponseDto } from '../dto/response/dish-response.dto.js';

export class DishMapper {
  static toResponse(entity: Dish): DishResponseDto {
    const dto = new DishResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.price = Number(entity.price);
    dto.isAvailable = entity.isAvailable;
    return dto;
  }

  static toResponseList(entities: Dish[]): DishResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
