import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ✅ Role-based Protected Route
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // 🧩 যদি user না থাকে, login পেজে পাঠাও
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🧩 যদি role allowed না হয়, তার নিজের dashboard এ পাঠাও
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "manager") return <Navigate to="/manager/dashboard" replace />;
    if (user.role === "staff") return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  // ✅ Access Granted
  return children;
}
