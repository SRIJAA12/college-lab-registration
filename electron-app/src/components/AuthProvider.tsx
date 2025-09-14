import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, apiHelpers } from '../api/axiosConfig';
import { User, AuthContextType } from '../types';
import { LOCAL_STORAGE_KEYS, SESSION_TIMEOUT } from '../utils/constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      const lastLogin = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_LOGIN);

      if (!token || !storedUser || !lastLogin) {
        setLoading(false);
        return;
      }

      // Check if session has expired
      const lastLoginTime = parseInt(lastLogin);
      const now = Date.now();
      if (now - lastLoginTime > SESSION_TIMEOUT) {
        clearAuth();
        setLoading(false);
        return;
      }

      // Verify token with server
      const response = await authAPI.verifyToken();
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Update last login time
        localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_LOGIN, now.toString());
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_LOGIN);
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        const now = Date.now();
        
        // Store authentication data
        localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_LOGIN, now.toString());
        
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    // Redirect to login page
    window.location.href = '/login';
  };

  const verifyDob = async (email: string, dob: string): Promise<string | null> => {
    try {
      const response = await authAPI.verifyDob(email, dob);
      if (response.data.success) {
        return response.data.resetToken;
      }
      return null;
    } catch (error) {
      console.error('DOB verification error:', error);
      return null;
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await authAPI.resetPassword(resetToken, newPassword);
      return response.data.success;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Initializing...</h5>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      verifyDob,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
