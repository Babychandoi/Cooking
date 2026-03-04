import { Controller, Get, Post, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import type { PaymentService } from '../service/payment.service.js';
import { PAYMENT_SERVICE } from '../service/payment.service.js';
import { CreatePaymentDto } from '../dto/request/create-payment.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('payments')
export class PaymentController {
  constructor(
    @Inject(PAYMENT_SERVICE)
    private readonly service: PaymentService,
  ) {}

  @Get()
  async findAll(@Query('invoiceId') invoiceId?: string) {
    const data = invoiceId
      ? await this.service.findByInvoice(invoiceId)
      : await this.service.findAll();
    return ApiResponse.ok(data);
  }

  @Get('invoice/:invoiceId')
  async findByInvoice(@Param('invoiceId') invoiceId: string) {
    const data = await this.service.findByInvoice(invoiceId);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    const data = await this.service.create(dto);
    return ApiResponse.created(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.ok(null);
  }
}
