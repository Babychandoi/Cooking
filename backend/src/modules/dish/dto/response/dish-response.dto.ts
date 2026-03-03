export class DishResponseDto {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isCombo: boolean;
  status: string;
  createdAt: Date;
}
