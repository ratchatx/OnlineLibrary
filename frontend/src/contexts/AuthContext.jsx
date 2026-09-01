import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and verify token validity with backend
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          } else {
            throw new Error('Invalid user profile response');
          }
        } catch (error) {
          console.warn('⚠️ Stored token validation failed. Clearing auth state.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login action
   */
  const login = async (username, password) => {
    const result = await authService.login(username, password);
    if (result.success && result.data) {
      const { user: userData, token: jwtToken } = result.data;
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(jwtToken);
      return userData;
    }
    throw new Error(result.message || 'Login failed');
  };

  /**
   * Logout action
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  /**
   * Change password action
   */
  const changePassword = async (currentPassword, newPassword) => {
    return await authService.changePassword(currentPassword, newPassword);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    logout,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
