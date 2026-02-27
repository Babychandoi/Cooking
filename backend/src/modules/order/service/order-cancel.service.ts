import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderRepository } from '../repository/order.repository.js';
import { OrderResponseDto } from '../dto/response/order-response.dto.js';
import { OrderMapper } from '../mapper/order.mapper.js';
import { OrderStatus } from '../entity/order.entity.js';
import { Ingredient } from '../../ingredient/entity/ingredient.entity.js';
import { EntityNotFoundException } from '../../../common/exception/exceptions/not-found.exception.js';
import { OrderCancelException } from '../../../common/exception/exceptions/order-cancel.exception.js';

@Injectable()
export class OrderCancelService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Cancel an order and restore ingredient stock from snapshot.
   * Uses isRestored flag to prevent double-restore.
   */
  async cancel(id: number, reason?: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new EntityNotFoundException('Order', id);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new OrderCancelException('Đơn hàng đã bị hủy trước đó');
    }

    if (order.status === OrderStatus.PREPARING || order.status === OrderStatus.COMPLETED) {
      throw new OrderCancelException('Không thể hủy đơn hàng đang chế biến hoặc đã hoàn thành');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Restore stock from snapshot (OrderItemIngredient)
      // Read ingredients WITHIN the transaction to avoid stale reads
      // when the same ingredient appears in multiple order items
      for (const item of order.items) {
        for (const oii of item.ingredients) {
          if (!oii.isRestored) {
            const ingredient = await queryRunner.manager.findOne(Ingredient, {
              where: { id: oii.ingredientId },
            });
            if (ingredient) {
              ingredient.stock = Number(ingredient.stock) + Number(oii.quantity);
              await queryRunner.manager.save(ingredient);
            }
            oii.isRestored = true;
            await queryRunner.manager.save(oii);
          }
        }
      }

      order.status = OrderStatus.CANCELLED;
      if (reason) {
        order.note = order.note
          ? `${order.note} | Cancel reason: ${reason}`
          : `Cancel reason: ${reason}`;
      }

      await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      const full = await this.orderRepository.findById(id);
      return OrderMapper.toResponse(full!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
