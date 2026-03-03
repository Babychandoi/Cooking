import { PaymentResponseDto } from '../dto/response/payment-response.dto.js';
import { CreatePaymentDto } from '../dto/request/create-payment.dto.js';

export interface PaymentService {
  findAll(): Promise<PaymentResponseDto[]>;
  findById(id: string): Promise<PaymentResponseDto>;
  findByInvoice(invoiceId: string): Promise<PaymentResponseDto[]>;
  create(dto: CreatePaymentDto): Promise<PaymentResponseDto>;
  delete(id: string): Promise<void>;
}

export const PAYMENT_SERVICE = 'PAYMENT_SERVICE';
