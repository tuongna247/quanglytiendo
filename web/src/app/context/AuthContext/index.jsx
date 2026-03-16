'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = '';

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('qlTD_token');
    const storedUser = localStorage.getItem('qlTD_user');
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('qlTD_token');
        localStorage.removeItem('qlTD_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error('Sai tên đăng nhập hoặc mật khẩu');

    const data = await res.json();
    const userInfo = {
      userId: data.userId,
      username: data.username,
      displayName: data.displayName,
    };

    localStorage.setItem('qlTD_token', data.token);
    localStorage.setItem('qlTD_user', JSON.stringify(userInfo));
    setUser(userInfo);
    return data;
  };

  const register = async (username, password, displayName) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, displayName }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Đăng ký thất bại');
    }

    return login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('qlTD_token');
    localStorage.removeItem('qlTD_user');
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/auth1/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
