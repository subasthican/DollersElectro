import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { toast } from 'react-hot-toast';

interface PasswordChangeGuardProps {
  children: React.ReactNode;
}

const PasswordChangeGuard: React.FC<PasswordChangeGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If user is authenticated and has temporary password, redirect to change password page
    // Allow access only to change-password and logout routes
    const allowedPaths = ['/change-password', '/login', '/logout'];
    
    if (isAuthenticated && user?.isTemporaryPassword && !allowedPaths.includes(location.pathname)) {
      console.log('🔴 User has temporary password, redirecting to change password page');
      toast.error('You must change your password before continuing');
      navigate('/change-password', { 
        replace: true,
        state: { isFirstLogin: true }
      });
    }
  }, [isAuthenticated, user?.isTemporaryPassword, location.pathname, navigate]);

  return <>{children}</>;
};

export default PasswordChangeGuard;





