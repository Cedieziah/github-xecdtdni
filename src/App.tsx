import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { store } from './store';
import { useAuth } from './hooks/useAuth';
import { RootState } from './store';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AuthConfirm from './components/auth/AuthConfirm';
import Dashboard from './pages/Dashboard';
import CertificationsPage from './pages/CertificationsPage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import CertificationDetailsPage from './pages/CertificationDetailsPage';
import NonAuthCertificationPage from './pages/NonAuthCertificationPage';
import ExamPage from './pages/ExamPage';
import ExamResultsPage from './pages/ExamResultsPage';
import AdminCertifications from './pages/admin/AdminCertifications';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCertificates from './pages/admin/AdminCertificates';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:id" element={isAuthenticated ? <CertificationDetailsPage /> : <NonAuthCertificationPage />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        
        {/* Protected routes */}
        {!isAuthenticated ? (
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/app/*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <>
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/certifications" element={<CertificationsPage />} />
            <Route path="/app/courses" element={<CourseCatalogPage />} />
            <Route path="/app/courses/:id" element={<CertificationDetailsPage />} />
            <Route path="/app/exam/:certificationId" element={<ExamPage />} />
            <Route path="/app/exam/session/:sessionId" element={<ExamPage />} />
            <Route path="/app/exam-results/:sessionId" element={<ExamResultsPage />} />
            
            {/* Admin routes */}
            {user?.role === 'admin' && (
              <>
                <Route path="/app/admin/certifications" element={<AdminCertifications />} />
                <Route path="/app/admin/questions" element={<AdminQuestions />} />
                <Route path="/app/admin/users" element={<AdminUsers />} />
                <Route path="/app/admin/certificates" element={<AdminCertificates />} />
                <Route path="/app/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/app/admin/reports" element={<AdminReports />} />
                <Route path="/app/admin/settings" element={<AdminSettings />} />
              </>
            )}
            
            <Route path="/auth" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-primary-dark font-robotic">
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#121212',
              color: '#F5F5F5',
              border: '1px solid #4A4A4A',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#F5F5F5',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#F5F5F5',
              },
            },
          }}
        />
      </div>
    </Provider>
  );
}

export default App;