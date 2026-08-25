import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import MedicalLoader from './components/common/MedicalLoader';
import ScrollToTopButton from './components/common/ScrollToTopButton';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PresentationPage = lazy(() => import('./pages/PresentationPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ChangePasswordPage = lazy(() => import('./pages/auth/ChangePasswordPage'));
const DynamicFormRenderer = lazy(() => import('./components/admin/custom-forms/DynamicFormRenderer'));
const TrackerWidgetView = lazy(() => import('./components/admin/custom-forms/TrackerWidgetView'));
const DynamicFormSubmissions = lazy(() => import('./components/admin/custom-forms/DynamicFormSubmissions'));

const PageLoadingFallback = () => (
  <MedicalLoader
    fullScreen={true}
    dark={true}
    text="Đang nạp hệ thống giao ban..."
    subtext="SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI • TTYT Khu Vực Bình Long"
  />
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />

              {/* Protected Department & Hospital Report */}
              <Route 
                path="/report" 
                element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Custom Forms Routes */}
              <Route 
                path="/custom-forms/:code" 
                element={
                  <ProtectedRoute>
                    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '1.5rem 1rem' }}>
                      <DynamicFormRenderer />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/custom-forms/:code/view" 
                element={
                  <ProtectedRoute>
                    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '1.5rem 1rem' }}>
                      <DynamicFormSubmissions readOnly={true} />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/custom-forms/:code/tracker" 
                element={
                  <ProtectedRoute>
                    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '1.5rem 1rem' }}>
                      <TrackerWidgetView />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/custom-forms/:code/submissions" 
                element={
                  <ProtectedRoute>
                    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '1.5rem 1rem' }}>
                      <DynamicFormSubmissions />
                    </div>
                  </ProtectedRoute>
                } 
              />

              {/* Admin Routes */}
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

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          {/* Global Floating Scroll To Top Button across all pages */}
          <ScrollToTopButton />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
