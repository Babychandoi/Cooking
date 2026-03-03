import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entity/invoice.entity.js';
import { InvoiceRepository } from './repository/invoice.repository.js';
import { InvoiceServiceImpl } from './service/invoice.service.impl.js';
import { InvoiceController } from './controller/invoice.controller.js';
import { INVOICE_SERVICE } from './service/invoice.service.js';
import { TableSessionModule } from '../table-session/table-session.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice]), forwardRef(() => TableSessionModule)],
  controllers: [InvoiceController],
  providers: [
    InvoiceRepository,
    {
      provide: INVOICE_SERVICE,
      useClass: InvoiceServiceImpl,
    },
  ],
  exports: [InvoiceRepository, INVOICE_SERVICE],
})
export class InvoiceModule {}
