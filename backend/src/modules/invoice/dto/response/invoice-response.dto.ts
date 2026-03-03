export class InvoiceResponseDto {
  id: string;
  tableSessionId: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  status: string;
  issuedAt: Date;
  payments?: {
    id: string;
    method: string;
    amount: number;
    paidAt: Date;
  }[];
}
