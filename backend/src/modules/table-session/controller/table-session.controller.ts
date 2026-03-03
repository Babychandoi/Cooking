import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Inject,
} from '@nestjs/common';
import type { TableSessionService } from '../service/table-session.service.js';
import { TABLE_SESSION_SERVICE } from '../service/table-session.service.js';
import { CreateTableSessionDto } from '../dto/request/create-table-session.dto.js';
import { ApiResponse } from '../../../common/response/api-response.js';

@Controller('table-sessions')
export class TableSessionController {
  constructor(
    @Inject(TABLE_SESSION_SERVICE)
    private readonly sessionService: TableSessionService,
  ) {}

  @Get()
  async findAll() {
    const data = await this.sessionService.findAll();
    return ApiResponse.ok(data);
  }

  @Get('table/:tableId')
  async findByTable(@Param('tableId') tableId: string) {
    const data = await this.sessionService.findByTable(tableId);
    return ApiResponse.ok(data);
  }

  @Get('table/:tableId/active')
  async findActiveByTable(@Param('tableId') tableId: string) {
    const data = await this.sessionService.findActiveByTable(tableId);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.sessionService.findById(id);
    return ApiResponse.ok(data);
  }

  @Get(':id/total')
  async getTotal(@Param('id') id: string) {
    const total = await this.sessionService.getSessionTotal(id);
    return ApiResponse.ok({ total });
  }

  @Post('open')
  async openSession(@Body() dto: CreateTableSessionDto) {
    const data = await this.sessionService.openSession(dto);
    return ApiResponse.created(data);
  }

  @Patch(':id/close')
  async closeSession(@Param('id') id: string) {
    const data = await this.sessionService.closeSession(id);
    return ApiResponse.ok(data, 'Session closed');
  }
}
