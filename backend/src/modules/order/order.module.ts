import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity.js';
import { OrderItem } from './entity/order-item.entity.js';
import { OrderItemIngredient } from './entity/order-item-ingredient.entity.js';
import { OrderRepository } from './repository/order.repository.js';
import { OrderItemRepository } from './repository/order-item.repository.js';
import { OrderItemIngredientRepository } from './repository/order-item-ingredient.repository.js';
import { OrderServiceImpl } from './service/order.service.impl.js';
import { OrderController } from './controller/order.controller.js';
import { ORDER_SERVICE } from './service/order.service.js';
import { RecipeModule } from '../recipe/recipe.module.js';
import { DishModule } from '../dish/dish.module.js';
import { IngredientModule } from '../ingredient/ingredient.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderItemIngredient]),
    RecipeModule,
    DishModule,
    IngredientModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderRepository,
    OrderItemRepository,
    OrderItemIngredientRepository,
    {
      provide: ORDER_SERVICE,
      useClass: OrderServiceImpl,
    },
  ],
  exports: [ORDER_SERVICE],
})
export class OrderModule {}
