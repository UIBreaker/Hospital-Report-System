import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!user && Boolean(localStorage.getItem('token')));

  const initAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authService.getMe();
        // Backend returns { success, data: { id, username, department_code, ... } }
        const userData = response.data || response;
        const fullUser = {
          id: userData.id,
          username: userData.username,
          fullName: userData.full_name || userData.department_name || userData.username,
          full_name: userData.full_name || userData.department_name || userData.username,
          departmentCode: userData.department_code || userData.departmentCode,
          departmentName: userData.department_name || userData.departmentName,
          role: userData.role,
          avatar_url: userData.avatar_url || '',
          phone: userData.phone || '',
          email: userData.email || '',
          certificate: userData.certificate || '',
          position: userData.position || '',
          signature_url: userData.signature_url || '',
          bio: userData.bio || '',
          source: userData.source
        };
        setUser(fullUser);
        localStorage.setItem('user_profile', JSON.stringify(fullUser));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_profile');
        setUser(null);
      }
    } else {
      localStorage.removeItem('user_profile');
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
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
      const fullUser = {
        id: userData.id,
        username: userData.username,
        fullName: userData.full_name || userData.departmentName || userData.username,
        full_name: userData.full_name || userData.departmentName || userData.username,
        departmentCode: userData.departmentCode,
        departmentName: userData.departmentName,
        role: userData.role,
        avatar_url: userData.avatar_url || '',
        phone: userData.phone || '',
        email: userData.email || '',
        certificate: userData.certificate || '',
        position: userData.position || '',
        signature_url: userData.signature_url || '',
        bio: userData.bio || '',
        source: userData.source
      };
      setUser(fullUser);
      localStorage.setItem('user_profile', JSON.stringify(fullUser));
    }
    return userData;
  };

  const updateCurrentUser = (updatedFields) => {
    setUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...updatedFields };
      if (updatedFields.full_name) {
        merged.fullName = updatedFields.full_name;
      }
      try {
        localStorage.setItem('user_profile', JSON.stringify(merged));
      } catch {}
      return merged;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
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
    <AuthContext.Provider value={{ user, login, logout, updateCurrentUser, refreshProfile: initAuth, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
