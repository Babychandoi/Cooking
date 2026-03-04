import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service.js';
import { InvoiceRepository } from '../repository/invoice.repository.js';
import { InvoiceMapper } from '../mapper/invoice.mapper.js';
import { InvoiceResponseDto } from '../dto/response/invoice-response.dto.js';
import { CreateInvoiceDto } from '../dto/request/create-invoice.dto.js';
import { UpdateInvoiceDto } from '../dto/request/update-invoice.dto.js';
import { Invoice } from '../entity/invoice.entity.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

@Injectable()
export class InvoiceServiceImpl implements InvoiceService {
  constructor(private readonly repository: InvoiceRepository) {}

  async findAll(query?: PaginationQueryDto): Promise<PaginatedResponse<InvoiceResponseDto>> {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const search = query?.search || '';

    const [invoices, total] = await this.repository.findAllPaginated(page, limit, search);
    const items = InvoiceMapper.toDtoList(invoices);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return InvoiceMapper.toDto(invoice);
  }

  async findByTableSession(tableSessionId: string): Promise<InvoiceResponseDto[]> {
    const invoices = await this.repository.findByTableSession(tableSessionId);
    return InvoiceMapper.toDtoList(invoices);
  }

  async create(dto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const invoice = new Invoice();
    invoice.tableSessionId = dto.tableSessionId;
    invoice.totalAmount = dto.totalAmount;
    invoice.vatAmount = dto.vatAmount ?? 0;
    invoice.finalAmount = dto.finalAmount;
    invoice.status = dto.status || 'pending';

    const saved = await this.repository.save(invoice);
    const loaded = await this.repository.findById(saved.id);
    return InvoiceMapper.toDto(loaded!);
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (dto.totalAmount !== undefined) invoice.totalAmount = dto.totalAmount;
    if (dto.vatAmount !== undefined) invoice.vatAmount = dto.vatAmount;
    if (dto.finalAmount !== undefined) invoice.finalAmount = dto.finalAmount;
    if (dto.status !== undefined) invoice.status = dto.status;

    const updated = await this.repository.save(invoice);
    return InvoiceMapper.toDto(updated);
  }

  async delete(id: string): Promise<void> {
    const invoice = await this.repository.findById(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    await this.repository.remove(id);
  }
}
