export class BranchDishResponseDto {
  id: string;
  branchId: string;
  branchName?: string;
  dishId: string;
  dishName?: string;
  price: number;
  isAvailable: boolean;
  status: string;
}
