import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo, useCallback } from 'react';
import { checkToken, getProfile, logoutUser } from '../services/service';
import { tryRefreshToken } from '../services/axiosClient';
import { toast } from 'react-toastify';
import { UserResponse } from '../types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserResponse | null;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);

  // Sử dụng useCallback để tránh tạo function mới mỗi lần render
  const fetchUserProfile = useCallback(async (): Promise<UserResponse | null> => {
    try {
      console.log('🔍 Fetching user profile...');
      const response = await getProfile();
      if (response.statusCode === 200 && response.data) {
        console.log('✅ User profile fetched successfully:', response.data.id);
        return response.data;
      }
      console.log('❌ No user data in response');
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Sử dụng useCallback cho refreshAuth
  const refreshAuth = useCallback(async () => {
    console.log('🔄 Refreshing auth...');
    const token = sessionStorage.getItem('access-token');
    
    if (!token) {
      console.log('❌ No token found');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Chỉ check token, không fetch profile mỗi lần
      const response = await checkToken(token);
      if (response.statusCode !== 200 || !response.data.valid) {
        console.log('🔄 Token invalid, trying refresh...');
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          console.log('❌ Refresh token failed');
          sessionStorage.clear();
          setIsAuthenticated(false);
          setUser(null);
          toast.info("Hết hạn đăng nhập");
          setLoading(false);
          return;
        }
        // Sau khi refresh token thành công, fetch profile mới
        console.log('✅ Token refreshed, fetching new profile');
        const userProfile = await fetchUserProfile();
        setUser(userProfile);
      } else {
        console.log('✅ Token is valid');
      }
      // Nếu token valid, giữ nguyên user hiện tại
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth refresh error:', error);
      sessionStorage.clear();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Sử dụng useCallback cho login
  const login = useCallback(async (token: string, refreshToken: string) => {
    console.log('🔑 Login process started');
    sessionStorage.setItem('access-token', token);
    sessionStorage.setItem('refresh-token', refreshToken);
    
    // Fetch user profile after login
    setLoading(true);
    try {
      const userProfile = await fetchUserProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
      console.log('✅ Login successful, user:', userProfile?.id);
    } catch (error) {
      console.error('Error fetching user profile after login:', error);
      toast.error('Đăng nhập thành công nhưng không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Sử dụng useCallback cho logout
  const logout = useCallback(async () => {
    console.log('🚪 Logging out...');
    try {
      await logoutUser();
    } catch (e) {
      // ignore logout errors
    }
    sessionStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  useEffect(() => {
    console.log('🏁 AuthProvider mounted, initial mount:', isInitialMount.current);
    
    // Chỉ chạy 1 lần khi component mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      const token = sessionStorage.getItem('access-token');
      if (token) {
        console.log('🔑 Found existing token, fetching user profile');
        // Nếu có token, fetch user profile
        setLoading(true);
        fetchUserProfile()
          .then(userProfile => {
            if (userProfile) {
              console.log('✅ Initial auth successful, user:', userProfile.id);
              setUser(userProfile);
              setIsAuthenticated(true);
            } else {
              console.log('❌ Initial auth failed - no user profile');
              setIsAuthenticated(false);
            }
          })
          .catch(error => {
            console.error('Error in initial auth:', error);
            setIsAuthenticated(false);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        console.log('❌ No existing token found');
        setLoading(false);
      }
    }

    return () => {
      console.log('🧹 AuthProvider cleanup');
    };
  }, [fetchUserProfile]);

  // Sử dụng useMemo để tránh tạo object mới mỗi lần render
  const contextValue = useMemo(() => ({
    isAuthenticated,
    user,
    login,
    logout,
    refreshAuth,
    loading
  }), [isAuthenticated, user, login, logout, refreshAuth, loading]);

  console.log('🎯 AuthContext rendering, authenticated:', isAuthenticated, 'user:', user?.id, 'loading:', loading);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  // Debug: log khi useAuth được gọi
  console.log('🎯 useAuth called, context:', {
    isAuthenticated: context.isAuthenticated,
    userId: context.user?.id,
    loading: context.loading
  });
  
  return context;
};