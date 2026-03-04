import { InvoiceResponseDto } from '../dto/response/invoice-response.dto.js';
import { CreateInvoiceDto } from '../dto/request/create-invoice.dto.js';
import { UpdateInvoiceDto } from '../dto/request/update-invoice.dto.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { PaginatedResponse } from '../../../common/response/paginated-response.js';

export interface InvoiceService {
  findAll(query?: PaginationQueryDto): Promise<PaginatedResponse<InvoiceResponseDto>>;
  findById(id: string): Promise<InvoiceResponseDto>;
  findByTableSession(tableSessionId: string): Promise<InvoiceResponseDto[]>;
  create(dto: CreateInvoiceDto): Promise<InvoiceResponseDto>;
  update(id: string, dto: UpdateInvoiceDto): Promise<InvoiceResponseDto>;
  delete(id: string): Promise<void>;
}

export const INVOICE_SERVICE = 'INVOICE_SERVICE';
