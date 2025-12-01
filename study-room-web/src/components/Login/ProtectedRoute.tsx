import React from "react";
import { Navigate } from "react-router-dom";
import { authAPI } from "../../utils/api";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
