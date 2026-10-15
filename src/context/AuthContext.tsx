import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  hasRole: (roles: AdminRole[]) => boolean;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nma_admin_token');
    const savedUser = localStorage.getItem('nma_admin_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with /api/auth/me
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        })
          .then((res) => {
            if (!res.ok) {
              logout();
            }
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
      } catch {
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: AdminUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('nma_admin_token', newToken);
    localStorage.setItem('nma_admin_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nma_admin_token');
    localStorage.removeItem('nma_admin_user');
  };

  const hasRole = (roles: AdminRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`
    };
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasRole, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
