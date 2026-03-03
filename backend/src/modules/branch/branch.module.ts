import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entity/branch.entity.js';
import { BranchRepository } from './repository/branch.repository.js';
import { BranchServiceImpl } from './service/branch.service.impl.js';
import { BranchController } from './controller/branch.controller.js';
import { BRANCH_SERVICE } from './service/branch.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  controllers: [BranchController],
  providers: [
    BranchRepository,
    {
      provide: BRANCH_SERVICE,
      useClass: BranchServiceImpl,
    },
  ],
  exports: [BranchRepository, BRANCH_SERVICE],
})
export class BranchModule {}
