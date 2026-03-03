import { OrderItemResponseDto } from './order-item-response.dto.js';

export class OrderResponseDto {
  id: string;
  tableSessionId: string;
  branchId: string;
  orderNumber: string;
  status: string;
  note: string;
  createdAt: Date;
  items: OrderItemResponseDto[];
}
