import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Token resmi untuk akses website
const VALID_ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN || '8351';

export function AuthProvider({ children }) {
  // Hanya autentikasi jika token di localStorage sesuai dengan VALID_ACCESS_TOKEN
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('dosen_access_token');
    return token === VALID_ACCESS_TOKEN;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dosen_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name && (parsed.name.includes('Ahmad') || parsed.name.includes('Dinur'))) {
          parsed.name = 'idk dan direxx';
          parsed.email = 'idk.direxx@student.univ.ac.id';
          localStorage.setItem('dosen_user', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        // ignore parse error
      }
    }
    return {
      id: 'usr-1',
      name: 'idk dan direxx',
      nim: '220101089',
      email: 'idk.direxx@student.univ.ac.id',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      university: 'Universitas Indonesia',
      program: 'Teknik Informatika - Semester 5'
    };
  });

  // Verifikasi token 8351
  const loginWithToken = (inputToken) => {
    const trimmed = String(inputToken || '').trim();
    if (trimmed === VALID_ACCESS_TOKEN) {
      localStorage.setItem('dosen_access_token', VALID_ACCESS_TOKEN);
      setIsAuthenticated(true);
      return { success: true };
    }
    return {
      success: false,
      message: 'Token akses salah! Masukkan token yang benar untuk mengakses website.'
    };
  };

  const login = (token) => {
    return loginWithToken(token).success;
  };

  const logout = () => {
    localStorage.removeItem('dosen_access_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
