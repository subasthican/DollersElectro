import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'employee' | 'admin';
  requireVerification?: boolean;
  require2FA?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'customer',
  requireVerification = false,
  require2FA = false,
}) => {
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

  // Check email verification if required
  if (requireVerification && user && !user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check 2FA if required
  if (require2FA && user && !user.isTwoFactorEnabled) {
    return <Navigate to="/setup-2fa" replace />;
  }

  // Check role-based access if required
  if (requiredRole && user) {
    const userRole = user.role as 'customer' | 'employee' | 'admin';
    
    // Define role hierarchy (higher number = higher privilege)
    const roleHierarchy: Record<'customer' | 'employee' | 'admin', number> = {
      customer: 1,
      employee: 2,
      admin: 3,
    };

    if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
      // User doesn't have sufficient permissions
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
