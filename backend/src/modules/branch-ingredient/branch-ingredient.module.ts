import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchIngredient } from './entity/branch-ingredient.entity.js';
import { BranchIngredientRepository } from './repository/branch-ingredient.repository.js';
import { BranchIngredientServiceImpl } from './service/branch-ingredient.service.impl.js';
import { BranchIngredientController } from './controller/branch-ingredient.controller.js';
import { BRANCH_INGREDIENT_SERVICE } from './service/branch-ingredient.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([BranchIngredient])],
  controllers: [BranchIngredientController],
  providers: [
    BranchIngredientRepository,
    {
      provide: BRANCH_INGREDIENT_SERVICE,
      useClass: BranchIngredientServiceImpl,
    },
  ],
  exports: [BranchIngredientRepository, BRANCH_INGREDIENT_SERVICE],
})
export class BranchIngredientModule {}
