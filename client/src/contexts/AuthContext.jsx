import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getMe();
          // Backend returns { success, data: { id, username, department_code, ... } }
          const userData = response.data || response;
          setUser({
            id: userData.id,
            username: userData.username,
            departmentCode: userData.department_code || userData.departmentCode,
            departmentName: userData.department_name || userData.departmentName,
            role: userData.role,
          });
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

    const login = async (username, password) => {
    const response = await authService.login(username, password);
    
    if (response?.mustChangePassword) {
      return {
        mustChangePassword: true,
        username: response.data?.username,
        full_name: response.data?.full_name,
        departmentCode: response.data?.departmentCode
      };
    }

    const result = response.data || response;
    const token = result.token;
    const userData = result.user;

    if (token) {
      localStorage.setItem('token', token);
      setUser({
        id: userData.id,
        username: userData.username,
        departmentCode: userData.departmentCode,
        departmentName: userData.departmentName,
        role: userData.role,
      });
    }
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner" style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
