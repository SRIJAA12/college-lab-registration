import React, { type ReactNode } from "react";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import RegisterLab from "./pages/RegisterLab";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register"; // optional

// ✅ Define props for protected routes
interface ProtectedRouteProps {
  children: ReactNode;
}

// 🔹 Student-only route
const StudentRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "student") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// 🔹 Faculty-only route
const FacultyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || role !== "faculty") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/register-lab"
          element={
            <StudentRoute>
              <RegisterLab />
            </StudentRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <FacultyRoute>
              <Dashboard />
            </FacultyRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
