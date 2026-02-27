import { OrderItemResponseDto } from './order-item-response.dto.js';

export class OrderResponseDto {
  id: number;
  customerName: string;
  tableNumber: number;
  status: string;
  totalPrice: number;
  note: string;
  createdAt: Date;
  items: OrderItemResponseDto[];
}
