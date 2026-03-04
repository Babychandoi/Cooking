import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { TableSessionService } from './table-session.service.js';
import { TableSessionRepository } from '../repository/table-session.repository.js';
import { CreateTableSessionDto } from '../dto/request/create-table-session.dto.js';
import { TableSessionResponseDto } from '../dto/response/table-session-response.dto.js';
import { TableSessionMapper } from '../mapper/table-session.mapper.js';
import { TableSession } from '../entity/table-session.entity.js';
import { EntityNotFoundException } from '../../../common/exception/exceptions/not-found.exception.js';
import type { TableService } from '../../table/service/table.service.js';
import { TABLE_SERVICE } from '../../table/service/table.service.js';
import type { InvoiceService } from '../../invoice/service/invoice.service.js';
import { INVOICE_SERVICE } from '../../invoice/service/invoice.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../order/entity/order.entity.js';

@Injectable()
export class TableSessionServiceImpl implements TableSessionService {
  constructor(
    private readonly sessionRepository: TableSessionRepository,
    @Inject(TABLE_SERVICE)
    private readonly tableService: TableService,
    @Inject(INVOICE_SERVICE)
    private readonly invoiceService: InvoiceService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<TableSessionResponseDto[]> {
    const sessions = await this.sessionRepository.findAll();
    return TableSessionMapper.toResponseList(sessions);
  }

  async findById(id: string): Promise<TableSessionResponseDto> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new EntityNotFoundException('TableSession', id);
    }
    return TableSessionMapper.toResponse(session);
  }

  async findActiveByTable(tableId: string): Promise<TableSessionResponseDto | null> {
    const session = await this.sessionRepository.findActiveByTable(tableId);
    return session ? TableSessionMapper.toResponse(session) : null;
  }

  async findByTable(tableId: string): Promise<TableSessionResponseDto[]> {
    const sessions = await this.sessionRepository.findByTable(tableId);
    return TableSessionMapper.toResponseList(sessions);
  }

  async openSession(dto: CreateTableSessionDto): Promise<TableSessionResponseDto> {
    // Check if table already has active session
    const activeSession = await this.sessionRepository.findActiveByTable(dto.tableId);
    if (activeSession) {
      throw new BadRequestException('Bàn này đang có phiên hoạt động');
    }

    // Create new session
    const session = new TableSession();
    session.tableId = dto.tableId;
    session.status = 'open';

    const saved = await this.sessionRepository.save(session);

    // Update table status to occupied
    await this.tableService.updateStatus(dto.tableId, 'occupied');

    return TableSessionMapper.toResponse(saved);
  }

  async closeSession(id: string): Promise<TableSessionResponseDto> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new EntityNotFoundException('TableSession', id);
    }

    if (session.status === 'closed') {
      throw new BadRequestException('Phiên này đã đóng');
    }

    // Check if there are any orders for this session
    const orders = await this.orderRepository.find({
      where: { tableSessionId: id },
      relations: ['items'],
    });

    // Auto-create invoice if there are orders
    if (orders.length > 0) {
      // Check if invoice already exists
      const existingInvoices = await this.invoiceService.findByTableSession(id);
      
      if (existingInvoices.length === 0) {
        // Calculate total from orders
        let totalAmount = 0;
        for (const order of orders) {
          if (order.status !== 'CANCELLED') {
            for (const item of order.items) {
              totalAmount += item.unitPrice * item.quantity;
            }
          }
        }

        // Create invoice
        if (totalAmount > 0) {
          const vatAmount = totalAmount * 0.08; // VAT 8%
          const finalAmount = totalAmount + vatAmount;
          
          await this.invoiceService.create({
            tableSessionId: id,
            totalAmount,
            vatAmount,
            finalAmount,
            status: 'pending',
          });
        }
      }
    }

    session.closedAt = new Date();
    session.status = 'closed';

    const saved = await this.sessionRepository.save(session);

    // Update table status to available
    await this.tableService.updateStatus(session.tableId, 'available');

    return TableSessionMapper.toResponse(saved);
  }

  async getSessionTotal(id: string): Promise<number> {
    return await this.sessionRepository.calculateTotal(id);
  }
}
