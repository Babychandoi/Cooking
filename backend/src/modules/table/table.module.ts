import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entity/table.entity.js';
import { TableRepository } from './repository/table.repository.js';
import { TableServiceImpl } from './service/table.service.impl.js';
import { TableController } from './controller/table.controller.js';
import { TABLE_SERVICE } from './service/table.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  controllers: [TableController],
  providers: [
    TableRepository,
    {
      provide: TABLE_SERVICE,
      useClass: TableServiceImpl,
    },
  ],
  exports: [TableRepository, TABLE_SERVICE],
})
export class TableModule {}
