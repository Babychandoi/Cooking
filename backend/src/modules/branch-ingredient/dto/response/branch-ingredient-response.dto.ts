export class BranchIngredientResponseDto {
  id: string;
  branchId: string;
  branchName?: string;
  ingredientId: string;
  ingredientName?: string;
  ingredientUnit?: string;
  stockQuantity: number;
  costPrice: number | null;
  updatedAt: Date;
}
