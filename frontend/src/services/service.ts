import { ApiResponse, IntrospectResponse, Login, LoginResponse, RegisterRequest } from "../types/auth";
import axios from 'axios';
import axiosClient from "./axiosClient";
import { UserResponse } from "../types/user";
const API_URL = process.env.REACT_APP_API_URL;

export const loginUser = async (data: Login): Promise<ApiResponse<LoginResponse>> => {
  const response = await axios.post<ApiResponse<LoginResponse>>(`${API_URL}/auth/login`, data);
  return response.data;
}

export const registerUser = async (data: RegisterRequest): Promise<ApiResponse<UserResponse>> => {
  const response = await axios.post<ApiResponse<UserResponse>>(`${API_URL}/auth/register`, data);
  return response.data;
}

export const checkToken = async (token: string): Promise<ApiResponse<IntrospectResponse>> => {
  const formData = { "token": token };
  const response = await axios.post<ApiResponse<IntrospectResponse>>(`${API_URL}/auth/introspect`, formData);
  return response.data;
}

export const getProfile = async (): Promise<ApiResponse<UserResponse>> => {
  const response = await axiosClient.get<ApiResponse<UserResponse>>(`/auth/me`);
  return response.data;
}

export const logoutUser = async (): Promise<ApiResponse<null>> => {
  const response = await axiosClient.post<ApiResponse<null>>(`/auth/logout`);
  return response.data;
}
