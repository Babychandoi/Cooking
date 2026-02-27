// ===== Ingredient =====
export interface IngredientResponse {
  id: number;
  name: string;
  unit: string;
  stock: number;
  version: number;
}

export interface CreateIngredientRequest {
  name: string;
  unit: string;
  stock: number;
}

export interface UpdateIngredientRequest {
  name?: string;
  unit?: string;
  stock?: number;
}

export interface RestockIngredientRequest {
  quantity: number;
}

// ===== Dish =====
export interface DishResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export interface CreateDishRequest {
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
}

export interface UpdateDishRequest {
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
}

// ===== Recipe =====
export interface RecipeItemResponse {
  id: number;
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface RecipeResponse {
  id: number;
  dishId: number;
  dishName: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  items: RecipeItemResponse[];
}

export interface RecipeItemRequest {
  ingredientId: number;
  quantity: number;
  unit: string;
}

export interface CreateRecipeRequest {
  dishId: number;
  items: RecipeItemRequest[];
}

export interface UpdateRecipeRequest {
  dishId: number;
  items: RecipeItemRequest[];
}

// ===== Order =====
export interface OrderItemResponse {
  id: number;
  dishId: number;
  dishName: string;
  quantity: number;
  unitPrice: number;
  recipeVersion: number;
}

export interface OrderResponse {
  id: number;
  customerName: string;
  tableNumber: number;
  status: string;
  totalPrice: number;
  note: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderItemRequest {
  dishId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName?: string;
  tableNumber?: number;
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

// ===== API Response =====
export interface CookingApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  timestamp: string;
}
