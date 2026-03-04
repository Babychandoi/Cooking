// ===== Restaurant Chain =====
export interface RestaurantChainResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface CreateRestaurantChainRequest {
  name: string;
  description?: string;
}

export interface UpdateRestaurantChainRequest {
  name?: string;
  description?: string;
}

// ===== Branch =====
export interface BranchResponse {
  id: string;
  chainId: string;
  name: string;
  address: string;
  phone: string;
  status: string;
  createdAt: string;
}

export interface CreateBranchRequest {
  chainId: string;
  name: string;
  address: string;
  phone: string;
}

export interface UpdateBranchRequest {
  name?: string;
  address?: string;
  phone?: string;
}

// ===== Table =====
export interface TableResponse {
  id: string;
  branchId: string;
  tableCode: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

export interface CreateTableRequest {
  branchId: string;
  tableCode: string;
  capacity: number;
}

export interface UpdateTableRequest {
  tableCode?: string;
  capacity?: number;
  status?: 'available' | 'occupied' | 'reserved';
}

// ===== Table Session =====
export interface TableSessionResponse {
  id: string;
  tableId: string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
}

export interface CreateTableSessionRequest {
  tableId: string;
}

// ===== Ingredient =====
export interface IngredientResponse {
  id: string;
  name: string;
  unit: string;
}

export interface CreateIngredientRequest {
  name: string;
  unit: string;
}

export interface UpdateIngredientRequest {
  name?: string;
  unit?: string;
}

// ===== Branch Ingredient =====
export interface BranchIngredientResponse {
  id: string;
  branchId: string;
  ingredientId: string;
  ingredientName: string;
  ingredientUnit: string;
  stockQuantity: string;
  costPrice: string;
  updatedAt: string;
}

export interface CreateBranchIngredientRequest {
  branchId: string;
  ingredientId: string;
  stock: number;
}

export interface UpdateBranchIngredientRequest {
  stock?: number;
}

export interface RestockBranchIngredientRequest {
  quantity: number;
}

// ===== Dish =====
export interface DishResponse {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface CreateDishRequest {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateDishRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
}

// ===== Branch Dish =====
export interface BranchDishResponse {
  id: string;
  branchId: string;
  dishId: string;
  dishName: string;
  price: number;
  isAvailable: boolean;
}

export interface CreateBranchDishRequest {
  branchId: string;
  dishId: string;
  price: number;
  isAvailable?: boolean;
}

export interface UpdateBranchDishRequest {
  price?: number;
  isAvailable?: boolean;
}

// ===== Recipe =====
export interface RecipeItemResponse {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface RecipeResponse {
  id: string;
  dishId: string;
  dishName: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  items: RecipeItemResponse[];
}

export interface RecipeItemRequest {
  ingredientId: string;
  quantity: number;
  unit: string;
}

export interface CreateRecipeRequest {
  dishId: string;
  items: RecipeItemRequest[];
}

export interface UpdateRecipeRequest {
  dishId: string;
  items: RecipeItemRequest[];
}

// ===== Order =====
export interface OrderItemResponse {
  id: string;
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
  recipeVersion: number;
}

export interface OrderResponse {
  id: string;
  tableSessionId: string;
  branchId: string;
  orderNumber: string;
  status: 'NEW' | 'PREPARING' | 'SERVED' | 'CANCELLED';
  note: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderItemRequest {
  dishId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateOrderRequest {
  tableSessionId: string;
  branchId: string;
  orderNumber?: string;
  note?: string;
  items: OrderItemRequest[];
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface InsufficientStockItem {
  name: string;
  required: number;
  available: number;
  shortage: number;
}

// ===== Invoice =====
export interface InvoiceResponse {
  id: string;
  tableSessionId: string;
  totalAmount: string;
  vatAmount: string;
  finalAmount: string;
  status: 'pending' | 'paid' | 'cancelled';
  issuedAt: string;
  payments: PaymentResponse[];
}

export interface CreateInvoiceRequest {
  tableSessionId: string;
  totalAmount: number;
  vatAmount?: number;
  finalAmount: number;
  status?: string;
}

// ===== Payment =====
export interface PaymentResponse {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paidAt: string;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'TRANSFER';
}

// ===== Pagination =====
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

// ===== API Response =====
export interface CookingApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  timestamp: string;
}
