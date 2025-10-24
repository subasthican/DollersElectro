import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { register as registerUser } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import LivingBulbForm from '../../components/auth/LivingBulbForm';

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error: reduxError } = useAppSelector((state) => state.auth);

  const handleSubmit = async (data: any) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error: any) {
      // Error is already in Redux state
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-start py-8 px-4 overflow-x-hidden">
        {/* Header - Fully transparent to show glow effect */}
        <div className="text-center mb-6 relative z-10 pointer-events-none">
        <h1 className="text-4xl font-bold mb-2 drop-shadow-2xl pointer-events-auto" style={{ 
          color: 'rgba(17, 24, 39, 0.85)',
          textShadow: '0 0 20px rgba(255,255,255,0.9), 0 0 40px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.1)',
          WebkitTextStroke: '0.5px rgba(255,255,255,0.3)'
        }}>
          Join Us! 🎉
        </h1>
        <p className="drop-shadow-xl pointer-events-auto" style={{ 
          color: 'rgba(75, 85, 99, 0.8)',
          textShadow: '0 0 15px rgba(255,255,255,0.9), 0 0 30px rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.1)'
        }}>
          Create your DollersElectro account
        </p>
        </div>

      {/* Living Bulb Form - SAME COMPONENT AS LOGIN! */}
      <div className="w-full max-w-4xl mx-auto overflow-visible relative" style={{ marginTop: '-80px' }}>
        <LivingBulbForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          errorMessage={reduxError || ''}
          mode="register"
        />
                </div>

      {/* Footer Links - Now with guaranteed visibility */}
      <div className="mt-20 mb-8 text-center space-y-3 z-50 relative">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign In
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

export default RegisterPage;
