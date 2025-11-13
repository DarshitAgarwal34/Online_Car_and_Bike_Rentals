import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { token, user } = useAuth();

  // not authenticated
  if (!token) return <Navigate to="/login" replace />;

  // if role required and user missing or role mismatch, redirect
  if (role) {
    // user.role must match required role
    if (!user || user.role !== role) {
      // you can redirect to a safe page or show 403 - using home
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
