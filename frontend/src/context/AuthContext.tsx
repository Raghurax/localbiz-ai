import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, BusinessProfile } from '../types';
import { apiFetch, setAuthToken, removeAuthToken, getAuthToken } from '../utils/api';

interface AuthContextType {
  user: User | null;
  business: BusinessProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  setBusiness: (biz: BusinessProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const biz = await apiFetch('/business/current');
      if (biz) {
        setBusiness(biz);
      }
    } catch (e) {
      console.error('Failed to load business profile:', e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      let token = getAuthToken();
      if (!token) {
        // Automatically seed with default demo account so all features work out-of-the-box
        try {
          const res = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'demo@localbiz.ai', password: 'demo123' })
          });
          setAuthToken(res.access_token);
          setUser(res.user);
          await refreshProfile();
          setIsLoading(false);
          return;
        } catch (err) {
          console.warn('Auto demo login skipped:', err);
        }
      }

      if (token) {
        try {
          const u = await apiFetch('/auth/me');
          setUser(u);
          await refreshProfile();
        } catch (e) {
          removeAuthToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(res.access_token);
    setUser(res.user);
    await refreshProfile();
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const res = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName })
    });
    setAuthToken(res.access_token);
    setUser(res.user);
    await refreshProfile();
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setBusiness(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshProfile,
        setBusiness
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};