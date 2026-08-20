import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { FaSpinner } from 'react-icons/fa';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PresentationPage = lazy(() => import('./pages/PresentationPage'));

const PageLoadingFallback = () => (
  <div style={{
    height: '100vh', width: '100vw',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0F2C59', color: '#FFFFFF', gap: '1rem'
  }}>
    <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: '#60A5FA' }} />
    <span style={{ fontSize: '1rem', fontWeight: '600', letterSpacing: '0.5px' }}>Đang nạp ứng dụng...</span>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route 
              path="/report" 
              element={
                <ProtectedRoute>
                  <ReportPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/presentation/:date" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <PresentationPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  </ErrorBoundary>
  );
}

export default App;
