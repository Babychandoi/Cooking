import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { OrderCancelService } from '../src/modules/order/service/order-cancel.service.js';
import { OrderRepository } from '../src/modules/order/repository/order.repository.js';
import { Order, OrderStatus } from '../src/modules/order/entity/order.entity.js';
import { OrderItemIngredient } from '../src/modules/order/entity/order-item-ingredient.entity.js';
import { OrderItem } from '../src/modules/order/entity/order-item.entity.js';
import { Ingredient } from '../src/modules/ingredient/entity/ingredient.entity.js';
import { EntityNotFoundException } from '../src/common/exception/exceptions/not-found.exception.js';
import { OrderCancelException } from '../src/common/exception/exceptions/order-cancel.exception.js';

describe('OrderCancelService', () => {
  let service: OrderCancelService;
  let orderRepo: jest.Mocked<OrderRepository>;
  let mockQueryRunner: any;

  const buildOrder = (
    status: OrderStatus,
    ingredients: Partial<OrderItemIngredient>[] = [],
  ): Order => {
    const o = new Order();
    o.id = 1;
    o.customerName = 'Test';
    o.tableNumber = 1;
    o.status = status;
    o.totalPrice = 50000;
    o.note = '';
    o.createdAt = new Date();

    const oii = ingredients.map((ing, idx) => {
      const item = new OrderItemIngredient();
      item.id = idx + 1;
      item.ingredientId = ing.ingredientId ?? 1;
      item.quantity = ing.quantity ?? 0.5;
      item.unit = ing.unit ?? 'kg';
      item.isRestored = ing.isRestored ?? false;
      return item;
    });

    const orderItem = new OrderItem();
    orderItem.id = 1;
    orderItem.ingredients = oii;
    o.items = [orderItem];
    return o;
  };

  beforeEach(async () => {
    const mockIngredient = new Ingredient();
    mockIngredient.id = 1;
    mockIngredient.stock = 5;

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn().mockResolvedValue({ ...mockIngredient }),
        save: jest.fn().mockImplementation((e) => Promise.resolve(e)),
      },
    };

    orderRepo = {
      findById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderCancelService,
        { provide: OrderRepository, useValue: orderRepo },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner) },
        },
      ],
    }).compile();

    service = module.get<OrderCancelService>(OrderCancelService);
  });

  it('should cancel PENDING order and restore stock', async () => {
    const order = buildOrder(OrderStatus.PENDING, [
      { ingredientId: 1, quantity: 2, isRestored: false },
    ]);
    orderRepo.findById.mockResolvedValue(order);

    await service.cancel(1);

    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(order.status).toBe(OrderStatus.CANCELLED);
    expect(order.items[0].ingredients[0].isRestored).toBe(true);
  });

  it('should cancel CONFIRMED order', async () => {
    const order = buildOrder(OrderStatus.CONFIRMED, [
      { ingredientId: 1, quantity: 1, isRestored: false },
    ]);
    orderRepo.findById.mockResolvedValue(order);

    await service.cancel(1);

    expect(order.status).toBe(OrderStatus.CANCELLED);
  });

  it('should append cancel reason to note', async () => {
    const order = buildOrder(OrderStatus.PENDING, []);
    order.note = 'Ghi chú';
    orderRepo.findById.mockResolvedValue(order);

    await service.cancel(1, 'Hết nguyên liệu');

    expect(order.note).toContain('Cancel reason: Hết nguyên liệu');
    expect(order.note).toContain('Ghi chú');
  });

  it('should not restore already-restored ingredients', async () => {
    const order = buildOrder(OrderStatus.PENDING, [
      { ingredientId: 1, quantity: 2, isRestored: true },
    ]);
    orderRepo.findById.mockResolvedValue(order);

    await service.cancel(1);

    // manager.findOne should not be called since ingredient is already restored
    expect(mockQueryRunner.manager.findOne).not.toHaveBeenCalled();
  });

  it('should throw OrderCancelException for already cancelled order', async () => {
    const order = buildOrder(OrderStatus.CANCELLED, []);
    orderRepo.findById.mockResolvedValue(order);

    await expect(service.cancel(1)).rejects.toThrow(OrderCancelException);
  });

  it('should throw OrderCancelException for PREPARING order', async () => {
    const order = buildOrder(OrderStatus.PREPARING, []);
    orderRepo.findById.mockResolvedValue(order);

    await expect(service.cancel(1)).rejects.toThrow(OrderCancelException);
  });

  it('should throw OrderCancelException for COMPLETED order', async () => {
    const order = buildOrder(OrderStatus.COMPLETED, []);
    orderRepo.findById.mockResolvedValue(order);

    await expect(service.cancel(1)).rejects.toThrow(OrderCancelException);
  });

  it('should throw EntityNotFoundException when order not found', async () => {
    orderRepo.findById.mockResolvedValue(null);

    await expect(service.cancel(99)).rejects.toThrow(EntityNotFoundException);
  });

  it('should rollback transaction on error', async () => {
    const order = buildOrder(OrderStatus.PENDING, [
      { ingredientId: 1, quantity: 1, isRestored: false },
    ]);
    orderRepo.findById.mockResolvedValue(order);
    mockQueryRunner.manager.findOne.mockRejectedValue(new Error('DB error'));

    await expect(service.cancel(1)).rejects.toThrow('DB error');
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });
});
