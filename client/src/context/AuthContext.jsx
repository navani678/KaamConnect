import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.js';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('kaamconnect_token') || null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('kaamconnect_token');
      const storedUser = localStorage.getItem('kaamconnect_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh from backend if online
          const profile = await authApi.getMe().catch(() => null);
          if (profile) {
            setUser(profile);
            localStorage.setItem('kaamconnect_user', JSON.stringify(profile));
            if (profile.language && profile.language !== i18n.language) {
              i18n.changeLanguage(profile.language);
            }
          }
        } catch (e) {
          console.error('Failed to parse auth user', e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const authToken = res.token;
      const authUser = res.user;

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('kaamconnect_token', authToken);
      localStorage.setItem('kaamconnect_user', JSON.stringify(authUser));

      if (authUser.language) {
        i18n.changeLanguage(authUser.language);
      }
      return authUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authApi.register(userData);
      const authToken = res.token;
      const authUser = res.user;

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('kaamconnect_token', authToken);
      localStorage.setItem('kaamconnect_user', JSON.stringify(authUser));

      if (authUser.language) {
        i18n.changeLanguage(authUser.language);
      }
      return authUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kaamconnect_token');
    localStorage.removeItem('kaamconnect_user');
  };

  const updateProfile = async (data) => {
    const updated = await authApi.updateMe(data);
    setUser(updated);
    localStorage.setItem('kaamconnect_user', JSON.stringify(updated));
    return updated;
  };

  const quickDemoLogin = async (role = 'customer') => {
    if (role === 'worker') {
      return await login('worker@demo.com', 'Demo@1234');
    }
    return await login('customer@demo.com', 'Demo@1234');
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    quickDemoLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
