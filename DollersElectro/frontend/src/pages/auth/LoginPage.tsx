import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { initializeAuth } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import LivingBulbForm from '../../components/auth/LivingBulbForm';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Read state from Redux instead of local state!
  const { isLoading, error: reduxError } = useAppSelector((state) => state.auth);
  
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (data: { email: string; password: string }) => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Call backend login - now returns tokens directly (no OTP)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success && result.data.tokens) {
        // Direct login successful - store tokens and user data
        localStorage.setItem('accessToken', result.data.tokens.accessToken);
        localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        console.log('✅ Login successful');
        console.log('📦 User data:', result.data.user);
        
        toast.success('Login successful!');
        
        // Determine target URL based on role
        const targetUrl = result.data.user.role === 'admin' ? '/admin' : 
                         result.data.user.role === 'employee' ? '/employee' : '/';
        
        // Initialize auth state from localStorage (syncs Redux state)
        dispatch(initializeAuth());
        
        // Navigate to appropriate page
        navigate(targetUrl, { replace: true });
      } else if (result.success && result.data.requiresPasswordChange) {
        // User has temporary password, navigate directly to change password page
        toast('Please change your temporary password', {
          icon: '🔐',
          duration: 3000
        });
        navigate('/change-password', {
          state: {
            changePasswordToken: result.data.changePasswordToken,
            email: result.data.user.email,
            firstName: result.data.user.firstName,
            role: result.data.user.role
          }
        });
      } else {
        toast.error(result.message || 'Login failed');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast.error('Failed to login. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-gray-600">The bulb is excited to see you again 💡</p>
      </div>

      {/* Living Bulb Form */}
      <LivingBulbForm
        onSubmit={handleSubmit}
        isLoading={isLoading || isSubmitting}
        errorMessage={reduxError || ''}
        mode="login"
      />

      {/* Footer Links */}
      <div className="mt-8 text-center space-y-3">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign Up
          </Link>
        </p>
        <p className="text-sm text-gray-600">
          <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium">
            Forgot Password?
          </Link>
        </p>
        <p className="text-sm text-gray-600">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
