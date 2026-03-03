import { CreateOrderDto } from '../dto/request/create-order.dto.js';
import { OrderResponseDto } from '../dto/response/order-response.dto.js';
import { OrderStatus } from '../entity/order.entity.js';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

export interface OrderService {
  findAll(): Promise<OrderResponseDto[]>;
  findPaginated(page: number, limit: number, search?: string): Promise<PaginatedResponse<OrderResponseDto>>;
  findById(id: string): Promise<OrderResponseDto>;
  create(dto: CreateOrderDto): Promise<OrderResponseDto>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderResponseDto>;
  cancel(id: string, reason?: string): Promise<OrderResponseDto>;
}

export const ORDER_SERVICE = 'ORDER_SERVICE';
