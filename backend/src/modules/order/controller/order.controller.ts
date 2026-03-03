import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Inject,
} from '@nestjs/common';
import type { OrderService } from '../service/order.service.js';
import { ORDER_SERVICE } from '../service/order.service.js';
import { CreateOrderDto } from '../dto/request/create-order.dto.js';
import { CancelOrderDto } from '../dto/request/cancel-order.dto.js';
import { UpdateOrderStatusDto } from '../dto/request/update-order-status.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderService: OrderService,
  ) {}

  @Get()
  async findAll(@Query() query: PaginationQueryDto) {
    const data = await this.orderService.findPaginated(
      query.page ?? 1,
      query.limit ?? 10,
      query.search,
    );
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.orderService.findById(id);
    return ApiResponse.ok(data);
  }

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const data = await this.orderService.create(dto);
    return ApiResponse.created(data);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const data = await this.orderService.updateStatus(id, dto.status);
    return ApiResponse.ok(data, 'Cập nhật trạng thái thành công');
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    const data = await this.orderService.cancel(id, dto.reason);
    return ApiResponse.ok(data, 'Order cancelled');
  }
}
