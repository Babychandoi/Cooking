import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../entity/order.entity.js';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}
