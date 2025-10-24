import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  TrophyIcon, 
  StarIcon,
  CheckCircleIcon,
  PlayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  timeLimit: number;
  passingScore: number;
  questionCount: number;
}

interface UserQuizStats {
  quizStats: {
    totalQuizzes: number;
    completedQuizzes: number;
    passedQuizzes: number;
    averageScore: number;
    totalTimeSpent: number;
    currentStreak: number;
    longestStreak: number;
  };
  quizPoints: number;
  badges: Array<{
    name: string;
    description: string;
    icon: string;
    category: string;
    earnedAt: string;
  }>;
}

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [stats, setStats] = useState<UserQuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const categories = ['all', 'Lighting', 'Tools', 'Electrical Panels', 'Cables', 'Switches', 'Sensors', 'Automation', 'Safety Equipment', 'Test Equipment'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // Fetch available quizzes
  const fetchQuizzes = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      
      console.log('Fetching quizzes from /api/quiz with params:', params.toString());
      const response = await fetch(`/api/quiz?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Quiz API response:', data);
      if (data.success) {
        setQuizzes(data.data.quizzes || []);
        setError(null);
        console.log('Quizzes loaded:', data.data.quizzes || []);
      } else {
        console.error('Failed to fetch quizzes:', data.message);
        setError(data.message || 'Failed to load quizzes');
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Network error. Please try again.');
      setQuizzes([]);
    }
  }, [selectedCategory, selectedDifficulty]);

  // Fetch user stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/quiz/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {

    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchQuizzes();
      await fetchStats();
      setLoading(false);
    };
    loadData();
  }, [selectedCategory, selectedDifficulty, fetchQuizzes]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lighting': return '💡';
      case 'Tools': return '🔧';
      case 'Electrical Panels': return '⚡';
      case 'Cables': return '🔌';
      case 'Switches': return '🔘';
      case 'Sensors': return '📡';
      case 'Automation': return '🤖';
      case 'Safety Equipment': return '🛡️';
      case 'Test Equipment': return '📊';
      default: return '⚡';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access the quiz system</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <AcademicCapIcon className="h-10 w-10 inline mr-3" />
            Electrical Knowledge Quizzes
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Test your electrical knowledge and earn points and badges!
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/quiz/history')}
              className="flex items-center px-8 py-4 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <ClockIcon className="h-6 w-6 mr-2" />
              📅 View Quiz History
            </button>
          </div>
        </div>

        {/* User Stats - iOS 26 Glassy */}
        {stats && (
          <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
              📊 Your Progress
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center backdrop-blur-xl bg-white/60 rounded-2xl p-4 border-2 border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="text-4xl font-bold text-blue-600">{stats.quizStats?.completedQuizzes || 0}</div>
                <div className="text-sm font-semibold text-gray-600 mt-1">Quizzes Completed</div>
              </div>
              <div className="text-center backdrop-blur-xl bg-white/60 rounded-2xl p-4 border-2 border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="text-4xl font-bold text-green-600">{stats.quizStats?.averageScore?.toFixed(1) || '0.0'}%</div>
                <div className="text-sm font-semibold text-gray-600 mt-1">Average Score</div>
              </div>
              <div className="text-center backdrop-blur-xl bg-white/60 rounded-2xl p-4 border-2 border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="text-4xl font-bold text-purple-600">{stats.quizPoints || 0}</div>
                <div className="text-sm font-semibold text-gray-600 mt-1">Total Points</div>
              </div>
              <div className="text-center backdrop-blur-xl bg-white/60 rounded-2xl p-4 border-2 border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="text-4xl font-bold text-blue-600">{stats.quizStats?.currentStreak || 0}</div>
                <div className="text-sm font-semibold text-gray-600 mt-1">Current Streak</div>
              </div>
            </div>

            {/* Badges - iOS 26 Glassy */}
            {stats.badges && stats.badges.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Your Badges</h3>
                <div className="flex flex-wrap gap-3">
                  {stats.badges.map((badge, index) => (
                    <div key={index} className="flex items-center backdrop-blur-xl bg-yellow-50/80 border-2 border-yellow-200/60 text-yellow-800 px-4 py-2 rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                      <span className="mr-2 text-lg">{badge.icon}</span>
                      {badge.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters - iOS 26 Glassy */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/60 p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🔍 Filter Quizzes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5rem',
                  paddingRight: '2.5rem'
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5rem',
                  paddingRight: '2.5rem'
                }}
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Difficulties' : difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quizzes Grid - iOS 26 Glassy */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-xl border-2 border-white/60 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{getCategoryIcon(quiz.category)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
                    <p className="text-sm font-medium text-gray-600">{quiz.category}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-2xl text-xs font-bold shadow-lg ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>

              <p className="text-gray-700 mb-6 font-medium">{quiz.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div className="flex items-center backdrop-blur-xl bg-white/60 px-3 py-2 rounded-xl border border-white/40 shadow-sm">
                  <ClockIcon className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-semibold text-gray-700">{quiz.timeLimit} min</span>
                </div>
                <div className="flex items-center backdrop-blur-xl bg-white/60 px-3 py-2 rounded-xl border border-white/40 shadow-sm">
                  <TrophyIcon className="h-4 w-4 mr-2 text-yellow-600" />
                  <span className="font-semibold text-gray-700">{quiz.points} pts</span>
                </div>
                <div className="flex items-center backdrop-blur-xl bg-white/60 px-3 py-2 rounded-xl border border-white/40 shadow-sm">
                  <StarIcon className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="font-semibold text-gray-700">{quiz.questionCount} questions</span>
                </div>
                <div className="flex items-center backdrop-blur-xl bg-white/60 px-3 py-2 rounded-xl border border-white/40 shadow-sm">
                  <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
                  <span className="font-semibold text-gray-700">{quiz.passingScore}% pass</span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Navigate to quiz taking page
                  navigate(`/quiz/${quiz.id}`);
                }}
                className="w-full backdrop-blur-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-600/95 hover:to-green-700/95 text-white py-3 px-4 rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold flex items-center justify-center"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                ▶️ Start Quiz
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Quizzes</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!error && quizzes.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Available</h3>
            <p className="text-gray-600 mb-4">No quizzes match your current filters. Try adjusting your selection.</p>
            <p className="text-sm text-gray-500">If you don't see any quizzes, please contact an administrator to add quizzes to the system.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
