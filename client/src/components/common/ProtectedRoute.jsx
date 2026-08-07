import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <FaSpinner className="spinner text-primary text-4xl" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/report" replace />;
  }

  return children;
};

export default ProtectedRoute;
