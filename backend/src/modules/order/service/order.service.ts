import { CreateOrderDto } from '../dto/request/create-order.dto.js';
import { OrderResponseDto } from '../dto/response/order-response.dto.js';
import { OrderStatus } from '../entity/order.entity.js';

export interface OrderService {
  findAll(): Promise<OrderResponseDto[]>;
  findById(id: number): Promise<OrderResponseDto>;
  create(dto: CreateOrderDto): Promise<OrderResponseDto>;
  updateStatus(id: number, status: OrderStatus): Promise<OrderResponseDto>;
  cancel(id: number, reason?: string): Promise<OrderResponseDto>;
}

export const ORDER_SERVICE = 'ORDER_SERVICE';
