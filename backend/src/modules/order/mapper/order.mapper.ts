import { Order } from '../entity/order.entity.js';
import { OrderResponseDto } from '../dto/response/order-response.dto.js';
import { OrderItemResponseDto } from '../dto/response/order-item-response.dto.js';
import { OrderItem } from '../entity/order-item.entity.js';

export class OrderMapper {
  static toResponse(entity: Order): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = entity.id;
    dto.customerName = entity.customerName;
    dto.tableNumber = entity.tableNumber;
    dto.status = entity.status;
    dto.totalPrice = Number(entity.totalPrice);
    dto.note = entity.note;
    dto.createdAt = entity.createdAt;
    dto.items = entity.items
      ? entity.items.map((item) => this.toItemResponse(item))
      : [];
    return dto;
  }

  static toItemResponse(item: OrderItem): OrderItemResponseDto {
    const dto = new OrderItemResponseDto();
    dto.id = item.id;
    dto.dishId = item.dishId;
    dto.dishName = item.dish?.name || '';
    dto.quantity = item.quantity;
    dto.unitPrice = Number(item.unitPrice);
    dto.recipeVersion = item.recipeVersion;
    return dto;
  }

  static toResponseList(entities: Order[]): OrderResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
