import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const QuizButton: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Only show for authenticated customers
  if (!isAuthenticated || user?.role !== 'customer') {
    return null;
  }

  const handleQuizClick = () => {
    navigate('/quiz');
  };

  return (
    <div className="relative group">
      {/* Quiz Button - iOS 26 Glassy Style */}
      <button
        onClick={handleQuizClick}
        className="w-16 h-16 backdrop-blur-2xl bg-gradient-to-br from-purple-500/90 to-indigo-600/90 hover:from-purple-600/95 hover:to-indigo-700/95 text-white rounded-2xl shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-110 flex items-center justify-center relative overflow-hidden"
        title="Take Electrical Knowledge Quiz"
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <AcademicCapIcon className="w-8 h-8 group-hover:rotate-6 transition-transform duration-300 relative z-10" />
      </button>
      
      {/* iOS Tooltip */}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-4 py-2 backdrop-blur-2xl bg-gray-900/95 text-white text-sm font-medium rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10 pointer-events-none">
        Electrical Knowledge Quiz
      </div>
    </div>
  );
};

export default QuizButton;
