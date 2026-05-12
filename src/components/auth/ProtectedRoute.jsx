import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // ✅ While Firebase is resolving the persisted session, render nothing.
  // This prevents the brief flash where currentUser is null and we
  // incorrectly redirect an already-logged-in user back to /auth.
  if (loading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
