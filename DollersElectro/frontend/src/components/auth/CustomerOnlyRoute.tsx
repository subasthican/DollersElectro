import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import LoadingSpinner from '../ui/LoadingSpinner';

interface CustomerOnlyRouteProps {
  children: React.ReactNode;
}

const CustomerOnlyRoute: React.FC<CustomerOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only allow customers to access these pages
  if (user && user.role !== 'customer') {
    // Redirect admin users to admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    // Redirect employee users to employee dashboard
    if (user.role === 'employee') {
      return <Navigate to="/employee" replace />;
    }
  }

  return <>{children}</>;
};

export default CustomerOnlyRoute;

