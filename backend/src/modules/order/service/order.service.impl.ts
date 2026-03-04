import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { OrderRepository } from '../repository/order.repository.js';
import { OrderMapper } from '../mapper/order.mapper.js';
import { CreateOrderDto } from '../dto/request/create-order.dto.js';
import { OrderResponseDto } from '../dto/response/order-response.dto.js';
import { Order, OrderStatus } from '../entity/order.entity.js';
import { OrderItem } from '../entity/order-item.entity.js';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

@Injectable()
export class OrderServiceImpl implements OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
  ) {}

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findAll();
    return OrderMapper.toResponseList(orders);
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    const [items, total] = await this.orderRepository.findPaginated(page, limit, search);
    const dtos = OrderMapper.toResponseList(items);
    return new PaginatedResponse(dtos, total, page, limit);
  }

  async findById(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return OrderMapper.toResponse(order);
  }

  async findByTableSession(tableSessionId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findByTableSession(tableSessionId);
    return OrderMapper.toResponseList(orders);
  }

  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    // Create new order
    const order = new Order();
    order.tableSessionId = dto.tableSessionId;
    order.branchId = dto.branchId;
    order.orderNumber = dto.orderNumber || `ORD-${Date.now()}`;
    order.status = OrderStatus.NEW;
    order.note = dto.note || '';

    // Create order items
    order.items = dto.items.map((itemDto) => {
      const orderItem = new OrderItem();
      orderItem.dishId = itemDto.dishId;
      orderItem.quantity = itemDto.quantity;
      orderItem.unitPrice = itemDto.unitPrice || 0;
      orderItem.recipeVersion = 1; // Default version
      return orderItem;
    });

    const saved = await this.orderRepository.save(order);
    const full = await this.orderRepository.findById(saved.id);
    return OrderMapper.toResponse(full!);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = status;
    await this.orderRepository.save(order);

    const full = await this.orderRepository.findById(id);
    return OrderMapper.toResponse(full!);
  }

  async cancel(id: string, reason?: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = OrderStatus.CANCELLED;
    if (reason) {
      order.note = `${order.note}\nCancelled: ${reason}`;
    }
    await this.orderRepository.save(order);

    const full = await this.orderRepository.findById(id);
    return OrderMapper.toResponse(full!);
  }
}
