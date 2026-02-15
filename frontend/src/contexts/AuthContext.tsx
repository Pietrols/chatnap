import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginInput, RegisterInput } from '../types';
import { authApi, userApi } from '../services/api';
import { socketService } from '../services/socket';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    if (token) {
      loadUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async (token: string) => {
    try {
      const userData = await userApi.getCurrentUser();
      setUser(userData);
      // Connect socket after loading user
      socketService.connect(token);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginInput) => {
    const response: AuthResponse = await authApi.login(data);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    socketService.connect(response.token);
  };

  const register = async (data: RegisterInput) => {
    const response: AuthResponse = await authApi.register(data);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    socketService.connect(response.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    socketService.disconnect();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
