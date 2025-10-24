import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  EyeIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface QuizHistoryItem {
  id: string;
  quiz: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    points: number;
  };
  score: number;
  totalPoints: number;
  isPassed: boolean;
  completedAt: string;
  timeSpent: number;
  attempts: number;
}

const QuizHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Test if backend is reachable first
      testBackendConnection().then(() => {
        fetchQuizHistory();
      });
    }
  }, [isAuthenticated]);

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch('/api/quiz', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Backend test response status:', response.status);
    } catch (error) {
      console.error('Backend connection test failed:', error);
    }
  };

  const fetchQuizHistory = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Fetching quiz history with token:', token ? 'present' : 'missing');
      console.log('Token value:', token);
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Decode the token to see what user ID it contains
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', tokenPayload);
        console.log('User ID from token:', tokenPayload.userId || tokenPayload.id);
      } catch (e) {
        console.log('Could not decode token:', e);
      }
      
      const response = await fetch('/api/quiz/user/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Quiz history response status:', response.status);
      console.log('Quiz history response ok:', response.ok);
      console.log('Quiz history response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Quiz history response data:', data);
      
      if (data.success) {
        const userQuizzes = data.data.userQuizzes || [];
        console.log('Received userQuizzes:', userQuizzes.length);
        setHistory(userQuizzes);
        setError(null);
      } else {
        console.error('API returned error:', data.message);
        setError(data.message || 'Failed to load quiz history');
      }
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (quizId: string, historyId: string) => {
    // Navigate to detailed results page
    navigate(`/quiz/${quizId}/results/${historyId}`);
  };

  const handleRetakeQuiz = (quizId: string) => {
    // Navigate to quiz taking page
    navigate(`/quiz/${quizId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Login Required</h2>
          <p className="text-gray-700 mb-6 font-medium">Please log in to view your quiz history</p>
          <button
            onClick={() => navigate('/login')}
            className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
          >
            🔐 Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-t-4 border-purple-600 mx-auto shadow-xl"></div>
          <p className="mt-6 text-gray-800 font-bold text-lg">Loading quiz history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 p-12">
          <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Error Loading History</h2>
          <p className="text-gray-700 mb-6 font-medium">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchQuizHistory();
              }}
              className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="backdrop-blur-2xl bg-gradient-to-br from-gray-500/90 to-gray-600/90 hover:from-gray-600/95 hover:to-gray-700/95 text-white px-8 py-4 rounded-2xl shadow-xl shadow-gray-500/30 hover:shadow-gray-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
            >
              Reload Page
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Check browser console (F12) for detailed error information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/quiz')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quiz History</h1>
                <p className="text-gray-600">View your completed quizzes and results</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {history.length} completed quiz{history.length !== 1 ? 'es' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <TrophyIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quiz History</h3>
            <p className="text-gray-600 mb-6">You haven't completed any quizzes yet.</p>
            <button
              onClick={() => navigate('/quiz')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Take Your First Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.quiz.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.quiz.difficulty)}`}>
                        {item.quiz.difficulty}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {item.quiz.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(item.completedAt)}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {formatTime(item.timeSpent)}
                      </div>
                      <div className="flex items-center">
                        <TrophyIcon className="h-4 w-4 mr-1" />
                        {item.attempts} attempt{item.attempts !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Score Display */}
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-lg font-bold ${getScoreBgColor(item.score)} ${getScoreColor(item.score)}`}>
                        {item.score}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.isPassed ? 'Passed' : 'Failed'}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(item.quiz.id, item.id)}
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => handleRetakeQuiz(item.quiz.id)}
                        className="flex items-center px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Retake Quiz"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Retake
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Score: {item.score}%</span>
                    <span>{item.totalPoints} points</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.isPassed ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistoryPage;
