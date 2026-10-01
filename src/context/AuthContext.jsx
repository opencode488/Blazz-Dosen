import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dosen_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
    // Default logged in demo user for ease of prototyping
    return {
      id: 'usr-1',
      name: 'Ahmad Dinur',
      nim: '220101089',
      email: 'ahmad.dinur@student.univ.ac.id',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      university: 'Universitas Indonesia',
      program: 'Teknik Informatika - Semester 5'
    };
  });

  const isAuthenticated = Boolean(user);

  const login = (email, password) => {
    const demoUser = {
      id: 'usr-1',
      name: 'Ahmad Dinur',
      nim: '220101089',
      email: email || 'ahmad.dinur@student.univ.ac.id',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      university: 'Universitas Indonesia',
      program: 'Teknik Informatika - Semester 5'
    };
    setUser(demoUser);
    localStorage.setItem('dosen_user', JSON.stringify(demoUser));
    localStorage.setItem('dosen_auth_token', 'mock_jwt_token_student_session');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dosen_user');
    localStorage.removeItem('dosen_auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
