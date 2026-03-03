import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchDish } from './entity/branch-dish.entity.js';
import { BranchDishRepository } from './repository/branch-dish.repository.js';
import { BranchDishServiceImpl } from './service/branch-dish.service.impl.js';
import { BranchDishController } from './controller/branch-dish.controller.js';
import { BRANCH_DISH_SERVICE } from './service/branch-dish.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([BranchDish])],
  controllers: [BranchDishController],
  providers: [
    BranchDishRepository,
    {
      provide: BRANCH_DISH_SERVICE,
      useClass: BranchDishServiceImpl,
    },
  ],
  exports: [BranchDishRepository, BRANCH_DISH_SERVICE],
})
export class BranchDishModule {}
