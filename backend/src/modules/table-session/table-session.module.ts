import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableSession } from './entity/table-session.entity.js';
import { TableSessionRepository } from './repository/table-session.repository.js';
import { TableSessionServiceImpl } from './service/table-session.service.impl.js';
import { TableSessionController } from './controller/table-session.controller.js';
import { TABLE_SESSION_SERVICE } from './service/table-session.service.js';
import { TableModule } from '../table/table.module.js';
import { InvoiceModule } from '../invoice/invoice.module.js';
import { Order } from '../order/entity/order.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableSession, Order]), 
    TableModule,
    forwardRef(() => InvoiceModule),
  ],
  controllers: [TableSessionController],
  providers: [
    TableSessionRepository,
    {
      provide: TABLE_SESSION_SERVICE,
      useClass: TableSessionServiceImpl,
    },
  ],
  exports: [TableSessionRepository, TABLE_SESSION_SERVICE],
})
export class TableSessionModule {}
