import axiosClient from './axiosClient';
import {
  CookingApiResponse,
  PaginatedResponse,
  PaginationQuery,
  RestaurantChainResponse,
  CreateRestaurantChainRequest,
  UpdateRestaurantChainRequest,
  BranchResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
  TableResponse,
  CreateTableRequest,
  UpdateTableRequest,
  TableSessionResponse,
  CreateTableSessionRequest,
  IngredientResponse,
  CreateIngredientRequest,
  UpdateIngredientRequest,
  BranchIngredientResponse,
  CreateBranchIngredientRequest,
  UpdateBranchIngredientRequest,
  RestockBranchIngredientRequest,
  DishResponse,
  CreateDishRequest,
  UpdateDishRequest,
  BranchDishResponse,
  CreateBranchDishRequest,
  UpdateBranchDishRequest,
  RecipeResponse,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  OrderResponse,
  CreateOrderRequest,
  InvoiceResponse,
  CreateInvoiceRequest,
  PaymentResponse,
  CreatePaymentRequest,
} from '../types/cooking';
import { UserResponse, CreateUserRequest, UpdateUserRequest } from '../types/user';

// ===== Restaurant Chains =====
export const restaurantChainApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<RestaurantChainResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<RestaurantChainResponse>>>('/restaurant-chains', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<RestaurantChainResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<RestaurantChainResponse>>(`/restaurant-chains/${id}`);
    return res.data;
  },
  create: async (data: CreateRestaurantChainRequest): Promise<CookingApiResponse<RestaurantChainResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<RestaurantChainResponse>>('/restaurant-chains', data);
    return res.data;
  },
  update: async (id: string, data: UpdateRestaurantChainRequest): Promise<CookingApiResponse<RestaurantChainResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<RestaurantChainResponse>>(`/restaurant-chains/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/restaurant-chains/${id}`);
    return res.data;
  },
};

// ===== Branches =====
export const branchApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<BranchResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<BranchResponse>>>('/branches', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<BranchResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<BranchResponse>>(`/branches/${id}`);
    return res.data;
  },
  getByChain: async (chainId: string): Promise<CookingApiResponse<BranchResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<BranchResponse[]>>(`/branches/chain/${chainId}`);
    return res.data;
  },
  create: async (data: CreateBranchRequest): Promise<CookingApiResponse<BranchResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<BranchResponse>>('/branches', data);
    return res.data;
  },
  update: async (id: string, data: UpdateBranchRequest): Promise<CookingApiResponse<BranchResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<BranchResponse>>(`/branches/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/branches/${id}`);
    return res.data;
  },
};

// ===== Tables =====
export const tableApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<TableResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<TableResponse>>>('/tables', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<TableResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<TableResponse>>(`/tables/${id}`);
    return res.data;
  },
  getByBranch: async (branchId: string): Promise<CookingApiResponse<TableResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<TableResponse[]>>(`/tables/branch/${branchId}`);
    return res.data;
  },
  create: async (data: CreateTableRequest): Promise<CookingApiResponse<TableResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<TableResponse>>('/tables', data);
    return res.data;
  },
  update: async (id: string, data: UpdateTableRequest): Promise<CookingApiResponse<TableResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<TableResponse>>(`/tables/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: string, status: 'available' | 'occupied' | 'reserved'): Promise<CookingApiResponse<TableResponse>> => {
    const res = await axiosClient.patch<CookingApiResponse<TableResponse>>(`/tables/${id}/status`, { status });
    return res.data;
  },
  delete: async (id: string): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/tables/${id}`);
    return res.data;
  },
};

// ===== Table Sessions =====
export const tableSessionApi = {
  getAll: async (): Promise<CookingApiResponse<TableSessionResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<TableSessionResponse[]>>('/table-sessions');
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<TableSessionResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<TableSessionResponse>>(`/table-sessions/${id}`);
    return res.data;
  },
  getByTable: async (tableId: string): Promise<CookingApiResponse<TableSessionResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<TableSessionResponse[]>>(`/table-sessions/table/${tableId}`);
    return res.data;
  },
  getActiveByTable: async (tableId: string): Promise<CookingApiResponse<TableSessionResponse | null>> => {
    const res = await axiosClient.get<CookingApiResponse<TableSessionResponse | null>>(`/table-sessions/table/${tableId}/active`);
    return res.data;
  },
  openSession: async (data: CreateTableSessionRequest): Promise<CookingApiResponse<TableSessionResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<TableSessionResponse>>('/table-sessions/open', data);
    return res.data;
  },
  closeSession: async (id: string): Promise<CookingApiResponse<TableSessionResponse>> => {
    const res = await axiosClient.patch<CookingApiResponse<TableSessionResponse>>(`/table-sessions/${id}/close`);
    return res.data;
  },
  getTotal: async (id: string): Promise<CookingApiResponse<number>> => {
    const res = await axiosClient.get<CookingApiResponse<number>>(`/table-sessions/${id}/total`);
    return res.data;
  },
};

// ===== Ingredients =====
export const ingredientApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<IngredientResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<IngredientResponse>>>('/ingredients', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<IngredientResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<IngredientResponse>>(`/ingredients/${id}`);
    return res.data;
  },
  create: async (data: CreateIngredientRequest): Promise<CookingApiResponse<IngredientResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<IngredientResponse>>('/ingredients', data);
    return res.data;
  },
  update: async (id: string, data: UpdateIngredientRequest): Promise<CookingApiResponse<IngredientResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<IngredientResponse>>(`/ingredients/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/ingredients/${id}`);
    return res.data;
  },
};

// ===== Branch Ingredients =====
export const branchIngredientApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<BranchIngredientResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<BranchIngredientResponse>>>('/branch-ingredients', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<BranchIngredientResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<BranchIngredientResponse>>(`/branch-ingredients/${id}`);
    return res.data;
  },
  getByBranch: async (branchId: string): Promise<CookingApiResponse<BranchIngredientResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<BranchIngredientResponse[]>>(`/branch-ingredients/branch/${branchId}`);
    return res.data;
  },
  create: async (data: CreateBranchIngredientRequest): Promise<CookingApiResponse<BranchIngredientResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<BranchIngredientResponse>>('/branch-ingredients', data);
    return res.data;
  },
  update: async (id: string, data: UpdateBranchIngredientRequest): Promise<CookingApiResponse<BranchIngredientResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<BranchIngredientResponse>>(`/branch-ingredients/${id}`, data);
    return res.data;
  },
  restock: async (id: string, data: RestockBranchIngredientRequest): Promise<CookingApiResponse<BranchIngredientResponse>> => {
    const res = await axiosClient.patch<CookingApiResponse<BranchIngredientResponse>>(`/branch-ingredients/${id}/restock`, data);
    return res.data;
  },
  delete: async (id: string): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/branch-ingredients/${id}`);
    return res.data;
  },
};

// ===== Dishes =====
export const dishApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<DishResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<DishResponse>>>('/dishes', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<DishResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<DishResponse>>(`/dishes/${id}`);
    return res.data;
  },
  create: async (data: CreateDishRequest): Promise<CookingApiResponse<DishResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<DishResponse>>('/dishes', data);
    return res.data;
  },
  update: async (id: string, data: UpdateDishRequest): Promise<CookingApiResponse<DishResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<DishResponse>>(`/dishes/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/dishes/${id}`);
    return res.data;
  },
  uploadImage: async (file: File): Promise<CookingApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post<CookingApiResponse<{ url: string }>>('/dishes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

// ===== Branch Dishes =====
export const branchDishApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<BranchDishResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<BranchDishResponse>>>('/branch-dishes', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<BranchDishResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<BranchDishResponse>>(`/branch-dishes/${id}`);
    return res.data;
  },
  getByBranch: async (branchId: string): Promise<CookingApiResponse<BranchDishResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<BranchDishResponse[]>>(`/branch-dishes/branch/${branchId}`);
    return res.data;
  },
  create: async (data: CreateBranchDishRequest): Promise<CookingApiResponse<BranchDishResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<BranchDishResponse>>('/branch-dishes', data);
    return res.data;
  },
  update: async (id: string, data: UpdateBranchDishRequest): Promise<CookingApiResponse<BranchDishResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<BranchDishResponse>>(`/branch-dishes/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/branch-dishes/${id}`);
    return res.data;
  },
};

// ===== Recipes =====
export const recipeApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<RecipeResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<RecipeResponse>>>('/recipes', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<RecipeResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<RecipeResponse>>(`/recipes/${id}`);
    return res.data;
  },
  getActiveByDish: async (dishId: string): Promise<CookingApiResponse<RecipeResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<RecipeResponse>>(`/recipes/dish/${dishId}/active`);
    return res.data;
  },
  create: async (data: CreateRecipeRequest): Promise<CookingApiResponse<RecipeResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<RecipeResponse>>('/recipes', data);
    return res.data;
  },
  update: async (id: string, data: UpdateRecipeRequest): Promise<CookingApiResponse<RecipeResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<RecipeResponse>>(`/recipes/${id}`, data);
    return res.data;
  },
  activate: async (id: string): Promise<CookingApiResponse<RecipeResponse>> => {
    const res = await axiosClient.patch<CookingApiResponse<RecipeResponse>>(`/recipes/${id}/activate`);
    return res.data;
  },
  delete: async (id: string): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/recipes/${id}`);
    return res.data;
  },
};

// ===== Orders =====
export const orderApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<OrderResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<OrderResponse>>>('/orders', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<OrderResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<OrderResponse>>(`/orders/${id}`);
    return res.data;
  },
  getByTableSession: async (tableSessionId: string): Promise<CookingApiResponse<OrderResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<OrderResponse[]>>(`/orders/table-session/${tableSessionId}`);
    return res.data;
  },
  create: async (data: CreateOrderRequest): Promise<CookingApiResponse<OrderResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<OrderResponse>>('/orders', data);
    return res.data;
  },
  cancel: async (id: string, reason?: string): Promise<CookingApiResponse<OrderResponse>> => {
    const res = await axiosClient.patch<CookingApiResponse<OrderResponse>>(`/orders/${id}/cancel`, { reason });
    return res.data;
  },
  updateStatus: async (id: string, status: string): Promise<CookingApiResponse<OrderResponse>> => {
    const res = await axiosClient.patch<CookingApiResponse<OrderResponse>>(`/orders/${id}/status`, { status });
    return res.data;
  },
};

// ===== Invoices =====
export const invoiceApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<InvoiceResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<InvoiceResponse>>>('/invoices', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<InvoiceResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<InvoiceResponse>>(`/invoices/${id}`);
    return res.data;
  },
  getByTableSession: async (tableSessionId: string): Promise<CookingApiResponse<InvoiceResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<InvoiceResponse>>(`/invoices/table-session/${tableSessionId}`);
    return res.data;
  },
  create: async (data: CreateInvoiceRequest): Promise<CookingApiResponse<InvoiceResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<InvoiceResponse>>('/invoices', data);
    return res.data;
  },
};

// ===== Payments =====
export const paymentApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<PaymentResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<PaymentResponse>>>('/payments', { params });
    return res.data;
  },
  getById: async (id: string): Promise<CookingApiResponse<PaymentResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<PaymentResponse>>(`/payments/${id}`);
    return res.data;
  },
  getByInvoice: async (invoiceId: string): Promise<CookingApiResponse<PaymentResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<PaymentResponse[]>>(`/payments/invoice/${invoiceId}`);
    return res.data;
  },
  create: async (data: CreatePaymentRequest): Promise<CookingApiResponse<PaymentResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<PaymentResponse>>('/payments', data);
    return res.data;
  },
};

// ===== Users (Employee Management) =====
export const userApi = {
  getAll: async (params?: PaginationQuery): Promise<CookingApiResponse<PaginatedResponse<UserResponse>>> => {
    const res = await axiosClient.get<CookingApiResponse<PaginatedResponse<UserResponse>>>('/users', { params });
    return res.data;
  },
  getById: async (id: number): Promise<CookingApiResponse<UserResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<UserResponse>>(`/users/${id}`);
    return res.data;
  },
  create: async (data: CreateUserRequest): Promise<CookingApiResponse<UserResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<UserResponse>>('/users', data);
    return res.data;
  },
  update: async (id: number, data: UpdateUserRequest): Promise<CookingApiResponse<UserResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<UserResponse>>(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/users/${id}`);
    return res.data;
  },
};
