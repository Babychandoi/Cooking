import axiosClient from './axiosClient';
import {
  CookingApiResponse,
  IngredientResponse,
  CreateIngredientRequest,
  UpdateIngredientRequest,
  DishResponse,
  CreateDishRequest,
  UpdateDishRequest,
  RecipeResponse,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  OrderResponse,
  CreateOrderRequest,
} from '../types/cooking';
import { UserResponse, CreateUserRequest, UpdateUserRequest } from '../types/user';

// ===== Ingredients =====
export const ingredientApi = {
  getAll: async (): Promise<CookingApiResponse<IngredientResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<IngredientResponse[]>>('/ingredients');
    return res.data;
  },
  getById: async (id: number): Promise<CookingApiResponse<IngredientResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<IngredientResponse>>(`/ingredients/${id}`);
    return res.data;
  },
  create: async (data: CreateIngredientRequest): Promise<CookingApiResponse<IngredientResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<IngredientResponse>>('/ingredients', data);
    return res.data;
  },
  update: async (id: number, data: UpdateIngredientRequest): Promise<CookingApiResponse<IngredientResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<IngredientResponse>>(`/ingredients/${id}`, data);
    return res.data;
  },
  restock: async (id: number, quantity: number): Promise<CookingApiResponse<IngredientResponse>> => {
    const res = await axiosClient.patch<CookingApiResponse<IngredientResponse>>(`/ingredients/${id}/restock`, { quantity });
    return res.data;
  },
  delete: async (id: number): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/ingredients/${id}`);
    return res.data;
  },
};

// ===== Dishes =====
export const dishApi = {
  getAll: async (): Promise<CookingApiResponse<DishResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<DishResponse[]>>('/dishes');
    return res.data;
  },
  getById: async (id: number): Promise<CookingApiResponse<DishResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<DishResponse>>(`/dishes/${id}`);
    return res.data;
  },
  create: async (data: CreateDishRequest): Promise<CookingApiResponse<DishResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<DishResponse>>('/dishes', data);
    return res.data;
  },
  update: async (id: number, data: UpdateDishRequest): Promise<CookingApiResponse<DishResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<DishResponse>>(`/dishes/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<CookingApiResponse<null>> => {
    const res = await axiosClient.delete<CookingApiResponse<null>>(`/dishes/${id}`);
    return res.data;
  },
};

// ===== Recipes =====
export const recipeApi = {
  getAll: async (): Promise<CookingApiResponse<RecipeResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<RecipeResponse[]>>('/recipes');
    return res.data;
  },
  getById: async (id: number): Promise<CookingApiResponse<RecipeResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<RecipeResponse>>(`/recipes/${id}`);
    return res.data;
  },
  getActiveByDish: async (dishId: number): Promise<CookingApiResponse<RecipeResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<RecipeResponse>>(`/recipes/dish/${dishId}/active`);
    return res.data;
  },
  create: async (data: CreateRecipeRequest): Promise<CookingApiResponse<RecipeResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<RecipeResponse>>('/recipes', data);
    return res.data;
  },
  update: async (id: number, data: UpdateRecipeRequest): Promise<CookingApiResponse<RecipeResponse>> => {
    const res = await axiosClient.put<CookingApiResponse<RecipeResponse>>(`/recipes/${id}`, data);
    return res.data;
  },
  activate: async (id: number): Promise<CookingApiResponse<RecipeResponse>> => {
    const res = await axiosClient.patch<CookingApiResponse<RecipeResponse>>(`/recipes/${id}/activate`);
    return res.data;
  },
};

// ===== Orders =====
export const orderApi = {
  getAll: async (): Promise<CookingApiResponse<OrderResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<OrderResponse[]>>('/orders');
    return res.data;
  },
  getById: async (id: number): Promise<CookingApiResponse<OrderResponse>> => {
    const res = await axiosClient.get<CookingApiResponse<OrderResponse>>(`/orders/${id}`);
    return res.data;
  },
  create: async (data: CreateOrderRequest): Promise<CookingApiResponse<OrderResponse>> => {
    const res = await axiosClient.post<CookingApiResponse<OrderResponse>>('/orders', data);
    return res.data;
  },
  cancel: async (id: number, reason?: string): Promise<CookingApiResponse<OrderResponse>> => {
    const res = await axiosClient.patch<CookingApiResponse<OrderResponse>>(`/orders/${id}/cancel`, { reason });
    return res.data;
  },
  updateStatus: async (id: number, status: string): Promise<CookingApiResponse<OrderResponse>> => {
    const res = await axiosClient.patch<CookingApiResponse<OrderResponse>>(`/orders/${id}/status`, { status });
    return res.data;
  },
};

// ===== Users (Employee Management) =====
export const userApi = {
  getAll: async (): Promise<CookingApiResponse<UserResponse[]>> => {
    const res = await axiosClient.get<CookingApiResponse<UserResponse[]>>('/users');
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
