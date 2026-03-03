import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import type { InvoiceService } from '../service/invoice.service.js';
import { INVOICE_SERVICE } from '../service/invoice.service.js';
import { CreateInvoiceDto } from '../dto/request/create-invoice.dto.js';
import { UpdateInvoiceDto } from '../dto/request/update-invoice.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('invoices')
export class InvoiceController {
  constructor(
    @Inject(INVOICE_SERVICE)
    private readonly service: InvoiceService,
  ) {}

  @Get()
  async findAll(@Query('tableSessionId') tableSessionId?: string) {
    const data = tableSessionId
      ? await this.service.findByTableSession(tableSessionId)
      : await this.service.findAll();
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateInvoiceDto) {
    const data = await this.service.create(dto);
    return ApiResponse.created(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    const data = await this.service.update(id, dto);
    return ApiResponse.ok(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.ok(null);
  }
}
