import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ShieldCheckIcon, 
  EnvelopeIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface LocationState {
  email: string;
  type: 'login' | 'reset';
  devOTP?: string;
}

const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [otp, setOTP] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes (600 seconds) for OTP expiration
  const [resendTimer, setResendTimer] = useState(30); // Start with 30-second cooldown (OTP just sent)
  const [canResend, setCanResend] = useState(false); // Disabled initially (OTP just sent)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email provided
  useEffect(() => {
    if (!state?.email) {
      toast.error('Session expired. Please try again.');
      navigate('/login');
    }
  }, [state, navigate]);

  // OTP Expiration Timer countdown (10 minutes)
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Resend Cooldown Timer (30 seconds)
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Auto-fill OTP in development/simulated mode
  useEffect(() => {
    if (state?.devOTP) {
      const otpArray = state.devOTP.split('');
      setOTP(otpArray);
      toast.success(`Development Mode: OTP auto-filled (${state.devOTP})`);
    }
  }, [state?.devOTP]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const pastedOTP = text.replace(/\D/g, '').slice(0, 6);
        const newOTP = pastedOTP.split('').concat(Array(6).fill('')).slice(0, 6);
        setOTP(newOTP);
        
        // Focus last filled input or first empty
        const lastIndex = pastedOTP.length - 1;
        if (lastIndex < 5) {
          inputRefs.current[lastIndex + 1]?.focus();
        }
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedOTP = pastedData.replace(/\D/g, '').slice(0, 6);
    const newOTP = pastedOTP.split('').concat(Array(6).fill('')).slice(0, 6);
    setOTP(newOTP);
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);

    try {
      if (state.type === 'login') {
        // Verify login OTP
        const response = await fetch('/api/auth/verify-login-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: state.email, otp: otpCode })
        });

        const data = await response.json();

        if (data.success) {
          try {
            // Store tokens with correct key names
            localStorage.setItem('accessToken', data.data.tokens.accessToken);
            localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            console.log('✅ OTP verified, tokens stored');
            console.log('📦 User data:', data.data.user);
            console.log('🔑 Access Token stored as accessToken');
            
            // Verify the data was stored correctly
            const storedToken = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');
            console.log('🔍 Verification - Token stored:', !!storedToken);
            console.log('🔍 Verification - User stored:', !!storedUser);
            
            if (!storedToken || !storedUser) {
              console.error('❌ Failed to store data in localStorage!');
              toast.error('Failed to save login data. Please try again.');
              setIsVerifying(false);
              return;
            }
            
            toast.success('Login successful!');
            
            // Determine target URL based on role
            const targetUrl = data.data.user.role === 'admin' ? '/admin' : 
                             data.data.user.role === 'employee' ? '/employee' : '/';
            
            console.log('🔄 Redirecting to:', targetUrl);
            
            // Use window.location.replace for a clean reload
            window.location.replace(targetUrl);
          } catch (error) {
            console.error('❌ Error during login finalization:', error);
            toast.error('Login failed. Please try again.');
            setIsVerifying(false);
          }
        } else {
          toast.error(data.message || 'Invalid OTP');
          setIsVerifying(false);
        }
      } else if (state.type === 'reset') {
        // Verify password reset OTP
        const response = await fetch('/api/auth/verify-reset-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: state.email, otp: otpCode })
        });

        const data = await response.json();

        if (data.success) {
          toast.success('OTP verified!');
          // Navigate to reset password page with token
          navigate('/reset-password', { 
            state: { 
              resetToken: data.data.resetToken,
              email: data.data.email 
            } 
          });
        } else {
          toast.error(data.message || 'Invalid OTP');
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      const endpoint = state.type === 'login' 
        ? '/api/auth/resend-login-otp'
        : '/api/auth/forgot-password';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('New code sent to your email!');
        setTimer(600); // Reset OTP expiration to 10 minutes
        setResendTimer(30); // Set resend cooldown to 30 seconds
        setCanResend(false);
        setOTP(['', '', '', '', '', '']); // Clear current OTP
        inputRefs.current[0]?.focus();

        // Auto-fill if development mode
        if (data.data?.devOTP) {
          setTimeout(() => {
            const otpArray = data.data.devOTP.split('');
            setOTP(otpArray);
            toast.success(`Development Mode: OTP auto-filled (${data.data.devOTP})`);
          }, 500);
        }
      } else {
        toast.error(data.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!state?.email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Main Card - iOS 26 Glassy Style */}
        <div className="backdrop-blur-2xl bg-white/70 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-2 border-white/40 p-10 hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-10">
            {/* Icon */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-500/90 via-blue-500/90 to-purple-600/90 rounded-[1.75rem] flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30 border-2 border-white/30">
              <ShieldCheckIcon className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
            
            {/* Title */}
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
              Verify Your Identity
            </h2>
            
            {/* Subtitle */}
            <p className="text-gray-600 text-base font-medium mb-3">
              We've sent a 6-digit code to
            </p>
            
            {/* Email Display */}
            <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-blue-50/60 px-4 py-2.5 rounded-2xl border border-blue-200/40">
              <EnvelopeIcon className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-semibold text-base">{state.email}</span>
            </div>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            {/* Input Boxes */}
            <div className="flex justify-center gap-2.5 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-14 h-16 text-center text-2xl font-bold backdrop-blur-xl bg-white/60 border-2 border-gray-300/60 rounded-2xl 
                           focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white/80
                           hover:bg-white/70 hover:border-gray-400/60
                           transition-all duration-200 outline-none shadow-sm"
                  autoFocus={index === 0}
                  style={{
                    color: digit ? '#1e40af' : '#6b7280'
                  }}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-sm mb-7">
              <ClockIcon className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">
                {timer > 0 ? (
                  <>Code expires in <span className="font-bold text-blue-600">{formatTime(timer)}</span></>
                ) : (
                  <span className="text-red-600 font-bold">Code expired</span>
                )}
              </span>
            </div>

            {/* Verify Button - iOS 26 Style */}
            <button
              onClick={handleVerify}
              disabled={isVerifying || otp.some(d => !d)}
              className="w-full backdrop-blur-xl bg-gradient-to-r from-blue-500/90 via-indigo-500/90 to-purple-600/90 
                       text-white py-4 px-6 rounded-2xl font-bold text-lg
                       hover:from-blue-600/95 hover:via-indigo-600/95 hover:to-purple-700/95 
                       focus:outline-none focus:ring-4 focus:ring-blue-500/40 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-all duration-300 
                       shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40
                       border-2 border-white/30 hover:border-white/50
                       transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <ArrowPathIcon className="w-6 h-6 animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </button>
          </div>

          {/* Resend Section */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-3 font-medium">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={isResending || !canResend}
              className="text-blue-600 font-bold hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed 
                       transition-colors text-sm"
            >
              {isResending ? '⏳ Sending...' : canResend ? 'Resend Code' : `Resend available in ${formatTime(resendTimer)}`}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-4 border-t border-gray-200/50">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-900 text-sm font-semibold transition-colors inline-flex items-center gap-1"
            >
              <span>←</span> Back to Login
            </button>
          </div>

          {/* Development Mode Indicator */}
          {state.devOTP && (
            <div className="mt-6 backdrop-blur-xl bg-yellow-50/70 border-2 border-yellow-200/50 rounded-2xl p-4">
              <p className="text-sm text-yellow-800 text-center font-medium">
                <span className="font-bold">🔧 Development Mode</span><br />
                Email not configured. OTP: <span className="font-mono font-bold text-base">{state.devOTP}</span>
              </p>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-medium">
            For your security, never share this code with anyone
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;

