import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import MedicalLoader from './components/common/MedicalLoader';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PresentationPage = lazy(() => import('./pages/PresentationPage'));

const PageLoadingFallback = () => (
  <MedicalLoader
    fullScreen={true}
    dark={true}
    text="Đang nạp hệ thống giao ban..."
    subtext="Sở Y Tế Bình Phước • TTYT Khu Vực Bình Long"
  />
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
