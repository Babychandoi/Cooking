import { Invoice } from '../entity/invoice.entity.js';
import { InvoiceResponseDto } from '../dto/response/invoice-response.dto.js';

export class InvoiceMapper {
  static toDto(entity: Invoice): InvoiceResponseDto {
    return {
      id: entity.id,
      tableSessionId: entity.tableSessionId,
      totalAmount: entity.totalAmount,
      vatAmount: entity.vatAmount,
      finalAmount: entity.finalAmount,
      status: entity.status,
      issuedAt: entity.issuedAt,
      payments: entity.payments?.map((p) => ({
        id: p.id,
        method: p.method,
        amount: p.amount,
        paidAt: p.paidAt,
      })),
    };
  }

  static toDtoList(entities: Invoice[]): InvoiceResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
