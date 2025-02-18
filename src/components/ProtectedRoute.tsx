import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isConnected: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isConnected, children }) => {
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
