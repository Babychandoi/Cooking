import axios from "axios";
import { toast } from "react-toastify";
import { ApiResponse, LoginResponse } from "../types/auth";

const axiosClient = axios.create({
  baseURL:process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access-token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      sessionStorage.getItem("refresh-token")
    ) {
      originalRequest._retry = true;
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        originalRequest.headers.Authorization = `Bearer ${sessionStorage.getItem("access-token")}`;
        return axiosClient(originalRequest);
      } else {
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
export async function tryRefreshToken(): Promise<boolean> {
    const refreshToken = sessionStorage.getItem("refresh-token");
    if (!refreshToken) return false;
    try {
      const response = await axios.post<ApiResponse<LoginResponse>>(`${process.env.REACT_APP_API_URL}/auth/refresh`, {
        refreshToken,
      });
  
      const data = response.data.data;
      if (!data?.token || !data?.refreshToken) return false;
  
      sessionStorage.setItem("access-token", data.token);
      sessionStorage.setItem("refresh-token", data.refreshToken);
  
      return true;
    } catch (error) {
      toast.error('Đăng nhập không thành công');
      return false;
    }
  }