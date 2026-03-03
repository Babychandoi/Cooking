export class TableSessionResponseDto {
  id: string;
  tableId: string;
  openedAt: Date;
  closedAt: Date | null;
  status: string;
}
