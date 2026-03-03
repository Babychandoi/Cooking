import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity.js';
import { PaymentRepository } from './repository/payment.repository.js';
import { PaymentServiceImpl } from './service/payment.service.impl.js';
import { PaymentController } from './controller/payment.controller.js';
import { PAYMENT_SERVICE } from './service/payment.service.js';
import { InvoiceModule } from '../invoice/invoice.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), InvoiceModule],
  controllers: [PaymentController],
  providers: [
    PaymentRepository,
    {
      provide: PAYMENT_SERVICE,
      useClass: PaymentServiceImpl,
    },
  ],
  exports: [PaymentRepository, PAYMENT_SERVICE],
})
export class PaymentModule {}
