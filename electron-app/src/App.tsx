import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import RegisterLab from './pages/RegisterLab';
import FacultyDashboard from './pages/FacultyDashboard';
import ErrorBoundary from './components/ErrorBoundary'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading application...</h5>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to={user?.role === 'student' ? '/register-lab' : '/faculty-dashboard'} replace /> : 
            <Login />
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          isAuthenticated ? 
            <Navigate to={user?.role === 'student' ? '/register-lab' : '/faculty-dashboard'} replace /> : 
            <ForgotPassword />
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/register-lab" 
        element={
          <ProtectedRoute role="student">
            <RegisterLab />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/faculty-dashboard" 
        element={
          <ProtectedRoute role="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Default Route */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={
              isAuthenticated 
                ? (user?.role === 'student' ? '/register-lab' : '/faculty-dashboard')
                : '/login'
            } 
            replace 
          />
        } 
      />

      {/* Catch all other routes */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={
              isAuthenticated 
                ? (user?.role === 'student' ? '/register-lab' : '/faculty-dashboard')
                : '/login'
            } 
            replace 
          />
        } 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
