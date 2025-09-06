"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState, LoginRequest, RegisterRequest } from "@/types/auth";
import { authApi, setAuthToken, getAuthToken } from "@/lib/api";
import toast from "react-hot-toast";

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const login = async (credentials: LoginRequest) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await authApi.login(credentials);

      setAuthToken(response.auth_token);
      setState({
        user: response.user,
        token: response.auth_token,
        isAuthenticated: true,
        isLoading: false,
      });

      // 認証成功時にAuthPageの状態をクリア
      if (typeof window !== "undefined") {
        localStorage.removeItem("authMode");
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await authApi.register(userData);

      setAuthToken(response.auth_token);
      setState({
        user: response.user,
        token: response.auth_token,
        isAuthenticated: true,
        isLoading: false,
      });

      // 認証成功時にAuthPageの状態をクリア
      if (typeof window !== "undefined") {
        localStorage.removeItem("authMode");
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast.success("ログアウトしました");
  };

  const checkAuth = async () => {
    const token = getAuthToken();

    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const user = await authApi.me();
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // トークンが無効な場合はクリア
      setAuthToken(null);
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
