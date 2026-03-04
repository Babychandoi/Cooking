import { Payment } from '../entity/payment.entity.js';
import { PaymentResponseDto } from '../dto/response/payment-response.dto.js';

export class PaymentMapper {
  static toDto(entity: Payment): PaymentResponseDto {
    return {
      id: entity.id,
      invoiceId: entity.invoiceId,
      method: entity.method,
      amount: entity.amount,
      status: entity.status,
      paidAt: entity.paidAt,
    };
  }

  static toDtoList(entities: Payment[]): PaymentResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
