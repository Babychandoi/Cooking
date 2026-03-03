export class PaymentResponseDto {
  id: string;
  invoiceId: string;
  method: string;
  amount: number;
  paidAt: Date;
}
