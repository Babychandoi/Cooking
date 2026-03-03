import { InvoiceResponseDto } from '../dto/response/invoice-response.dto.js';
import { CreateInvoiceDto } from '../dto/request/create-invoice.dto.js';
import { UpdateInvoiceDto } from '../dto/request/update-invoice.dto.js';

export interface InvoiceService {
  findAll(): Promise<InvoiceResponseDto[]>;
  findById(id: string): Promise<InvoiceResponseDto>;
  findByTableSession(tableSessionId: string): Promise<InvoiceResponseDto[]>;
  create(dto: CreateInvoiceDto): Promise<InvoiceResponseDto>;
  update(id: string, dto: UpdateInvoiceDto): Promise<InvoiceResponseDto>;
  delete(id: string): Promise<void>;
}

export const INVOICE_SERVICE = 'INVOICE_SERVICE';
