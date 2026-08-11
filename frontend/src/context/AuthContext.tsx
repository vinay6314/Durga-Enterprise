import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import api from '../services/api';

export const isOrgUser = (_email: string) => true;

interface AuthContextType {
  user: User | null;
  token: string | null;
  userScope: 'all' | 'mine';
  isPersonal: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUserData: (newUser: User, newToken?: string) => void;
  switchRoleQuickly: (email: string, roleName: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('erp_user');
      return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('erp_token');
    return savedToken && savedToken !== 'undefined' ? savedToken : null;
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleUnauth = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
    };

    window.addEventListener('auth:unauthorized', handleUnauth);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauth);
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('erp_token', newToken);
    localStorage.setItem('erp_user', JSON.stringify(newUser));
    localStorage.removeItem('erp_user_scope');
  };

  const updateUserData = (newUser: User, newToken?: string) => {
    setUser(newUser);
    localStorage.setItem('erp_user', JSON.stringify(newUser));
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('erp_token', newToken);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_user_scope');
  };

  const switchRoleQuickly = async (email: string, roleName: string) => {
    try {
      let password = 'Admin@123';
      if (roleName === 'SALES') password = 'Sales@123';
      if (roleName === 'WAREHOUSE') password = 'Warehouse@123';
      if (roleName === 'ACCOUNTS') password = 'Accounts@123';

      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
      }
    } catch (err) {
      console.error('Quick role switch failed', err);
    }
  };

  const isPersonal = false;
  const userScope: 'all' | 'mine' = 'all';

  return (
    <AuthContext.Provider value={{ user, token, userScope, isPersonal, login, logout, updateUserData, switchRoleQuickly, loading }}>
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
