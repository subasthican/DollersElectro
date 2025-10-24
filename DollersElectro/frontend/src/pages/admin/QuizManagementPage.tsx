import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  PlayIcon,
  PauseIcon,
  AcademicCapIcon,
  TrophyIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  FireIcon,
  ArrowLeftIcon,
  HomeIcon
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
  isActive: boolean;
  questionCount: number;
  questions?: string[]; // Array of question IDs
  attempts: number;
  completions: number;
  averageScore: number;
  createdAt: string;
}

interface Question {
  id: string;
  _id?: string; // MongoDB _id field
  question: string;
  type: 'multiple_choice' | 'true_false' | 'multiple_select';
  category: string;
  difficulty: string;
  points: number;
  isActive: boolean;
  usageCount: number;
  successRate: number;
  createdAt: string;
}

const QuizManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showManageQuestions, setShowManageQuestions] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    category: 'Lighting',
    difficulty: 'Beginner',
    points: 10,
    timeLimit: 15,
    passingScore: 70,
    tags: ['']
  });

  // Question form state for quiz questions
  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: 'multiple_choice' as 'multiple_choice' | 'true_false' | 'multiple_select',
    category: 'Lighting',
    difficulty: 'Beginner',
    points: 1,
    options: ['', ''],
    correctAnswer: 0,
    explanation: ''
  });

  // Fetch quizzes
  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/quiz/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setQuizzes(data.data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/quiz/admin/questions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.questions || []);
      } else {
        console.error('Failed to fetch questions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchQuizzes(), fetchQuestions()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleQuizStatus = async (quizId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/quiz/admin/${quizId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        await fetchQuizzes();
      }
    } catch (error) {

    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/quiz/admin/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        await fetchQuizzes();
      }
    } catch (error) {

    }
  };


  // Create quiz function
  const createQuiz = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/quiz/admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...quizForm,
          tags: quizForm.tags.filter(tag => tag.trim() !== '')
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowCreateQuiz(false);
        setEditingQuiz(null);
        setQuizForm({
          title: '',
          description: '',
          category: 'Lighting',
          difficulty: 'Beginner',
          points: 10,
          timeLimit: 15,
          passingScore: 70,
          tags: ['']
        });
        await fetchQuizzes();
        alert('Quiz created successfully!');
      } else {
        alert('Error creating quiz: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz');
    }
  };

  // Update quiz function
  const updateQuiz = async () => {
    if (!editingQuiz) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/quiz/admin/${editingQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...quizForm,
          tags: quizForm.tags.filter(tag => tag.trim() !== '')
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowCreateQuiz(false);
        setEditingQuiz(null);
        setQuizForm({
          title: '',
          description: '',
          category: 'Lighting',
          difficulty: 'Beginner',
          points: 10,
          timeLimit: 15,
          passingScore: 70,
          tags: ['']
        });
        await fetchQuizzes();
        alert('Quiz updated successfully!');
      } else {
        alert('Error updating quiz: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Error updating quiz');
    }
  };

  // Open edit quiz modal
  const openEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
      points: quiz.points,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      tags: ['']
    });
    setShowCreateQuiz(true);
  };


  // Remove question from quiz
  const removeQuestionFromQuiz = async (quizId: string, questionId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/quiz/admin/${quizId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        await Promise.all([fetchQuizzes(), fetchQuestions()]);
        alert('Question removed from quiz successfully!');
      } else {
        alert('Error removing question: ' + data.message);
      }
    } catch (error) {
      console.error('Error removing question from quiz:', error);
      alert('Error removing question from quiz');
    }
  };

  // Open manage questions modal
  const openManageQuestions = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowManageQuestions(true);
    // Fetch fresh questions data
    await fetchQuestions();
    // Reset question form
    setQuestionForm({
      question: '',
      type: 'multiple_choice',
      category: quiz.category,
      difficulty: quiz.difficulty,
      points: 1,
      options: ['', ''],
      correctAnswer: 0,
      explanation: ''
    });
  };

  // Create question for quiz
  const createQuestionForQuiz = async () => {
    if (!selectedQuiz || !questionForm.question.trim()) {
      alert('Please enter a question');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      // First create the question
      const questionResponse = await fetch('/api/quiz/admin/questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: questionForm.question,
          type: questionForm.type,
          category: questionForm.category,
          difficulty: questionForm.difficulty,
          points: questionForm.points,
          options: questionForm.type === 'multiple_choice' ? questionForm.options.map((text, index) => ({
            text,
            isCorrect: index === questionForm.correctAnswer
          })) : questionForm.type === 'true_false' ? [
            { text: 'True', isCorrect: questionForm.correctAnswer === 0 },
            { text: 'False', isCorrect: questionForm.correctAnswer === 1 }
          ] : [],
          correctAnswer: questionForm.correctAnswer,
          explanation: questionForm.explanation
        })
      });

      const questionData = await questionResponse.json();
      if (!questionData.success) {
        alert('Error creating question: ' + questionData.message);
        return;
      }

      // Then add the question to the quiz
      const addResponse = await fetch(`/api/quiz/admin/${selectedQuiz.id}/questions/${questionData.data.question.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const addData = await addResponse.json();
      if (addData.success) {
        // Reset form
        setQuestionForm({
          question: '',
          type: 'multiple_choice',
          category: selectedQuiz.category,
          difficulty: selectedQuiz.difficulty,
          points: 1,
          options: ['', ''],
          correctAnswer: 0,
          explanation: ''
        });
        
        // Refresh data
        await Promise.all([fetchQuizzes(), fetchQuestions()]);
        alert('Question added to quiz successfully!');
      } else {
        alert('Error adding question to quiz: ' + addData.message);
      }
    } catch (error) {
      console.error('Error creating question for quiz:', error);
      alert('Error creating question for quiz');
    }
  };

  // Update question function
  const updateQuestion = async () => {
    if (!editingQuestion || !questionForm.question.trim()) {
      alert('Please enter a question');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`/api/quiz/admin/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: questionForm.question,
          type: questionForm.type,
          category: questionForm.category,
          difficulty: questionForm.difficulty,
          points: questionForm.points,
          options: questionForm.type === 'multiple_choice' ? questionForm.options.map((text, index) => ({
            text,
            isCorrect: index === questionForm.correctAnswer
          })) : questionForm.type === 'true_false' ? [
            { text: 'True', isCorrect: questionForm.correctAnswer === 0 },
            { text: 'False', isCorrect: questionForm.correctAnswer === 1 }
          ] : [],
          correctAnswer: questionForm.correctAnswer,
          explanation: questionForm.explanation
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowEditQuestion(false);
        setEditingQuestion(null);
        setQuestionForm({
          question: '',
          type: 'multiple_choice',
          category: 'Lighting',
          difficulty: 'Beginner',
          points: 1,
          options: ['', ''],
          correctAnswer: 0,
          explanation: ''
        });
        
        // Refresh data
        await Promise.all([fetchQuizzes(), fetchQuestions()]);
        alert('Question updated successfully!');
      } else {
        alert('Error updating question: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Error updating question');
    }
  };

  // Open edit question modal
  const openEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      type: question.type,
      category: question.category,
      difficulty: question.difficulty,
      points: question.points,
      options: question.type === 'multiple_choice' ? ['Option 1', 'Option 2', 'Option 3', 'Option 4'] : ['', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setShowEditQuestion(true);
  };

  const categories = ['all', 'Lighting', 'Tools', 'Electrical Panels', 'Cables', 'Switches', 'Sensors', 'Automation', 'Safety Equipment', 'Test Equipment'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz management...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - iOS 26 Glassy Style */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Breadcrumb */}
          <div className="py-4 border-b border-white/40">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center hover:text-gray-700 transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Admin Dashboard
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Quiz Management</span>
            </nav>
          </div>
          
          <div className="py-6">
            {/* Mobile Navigation */}
            <div className="flex items-center justify-between mb-4 md:hidden">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go Back"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Quiz Management</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Go Back"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <AcademicCapIcon className="w-8 h-8 mr-3 text-blue-600" />
                    Quiz Management
                  </h1>
                  <p className="text-gray-600 mt-1">Manage quizzes and questions for the electrical knowledge system</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateQuiz(true)}
                  className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Quiz
                </button>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex space-x-3 md:hidden">
              <button
                onClick={() => setShowCreateQuiz(true)}
                className="flex-1 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-4 py-2 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold flex items-center justify-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards - iOS 26 Glassy Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 border-2 border-white/60 hover:border-blue-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-green-500/10 hover:shadow-green-500/20 border-2 border-white/60 hover:border-green-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/90 to-green-600/90 shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform duration-300">
                <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-yellow-500/10 hover:shadow-yellow-500/20 border-2 border-white/60 hover:border-yellow-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/90 to-yellow-600/90 shadow-lg shadow-yellow-500/50 group-hover:scale-110 transition-transform duration-300">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Active Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.filter(q => q.isActive).length}</p>
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-2xl bg-white/80 hover:bg-white/90 rounded-2xl shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 border-2 border-white/60 hover:border-purple-200/60 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/90 to-purple-600/90 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform duration-300">
                <FireIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.reduce((sum, q) => sum + q.attempts, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Management Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <AcademicCapIcon className="h-6 w-6 mr-2" />
              Quiz Management ({quizzes.length})
            </h2>
          </div>
        </div>

        {/* Search and Filters - iOS 26 Glassy Style */}
        <div className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 appearance-none cursor-pointer font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5rem 1.5rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 appearance-none cursor-pointer font-medium"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5rem 1.5rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="all">All Difficulties</option>
              {difficulties.slice(1).map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 appearance-none cursor-pointer font-medium"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5rem 1.5rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="createdAt">Created Date</option>
                <option value="title">Title</option>
                <option value="difficulty">Difficulty</option>
                <option value="attempts">Attempts</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl hover:bg-white/75 flex items-center shadow-sm transition-all duration-300 hover:scale-105"
              >
                <ArrowsUpDownIcon className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Quizzes Section */}
        <div className="space-y-6">
          {quizzes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Found</h3>
              <p className="text-gray-600">Use the 'Create Quiz' button above to add quizzes.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="backdrop-blur-2xl bg-white/80 rounded-2xl shadow-xl border-2 border-white/60 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getCategoryIcon(quiz.category)}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{quiz.title}</h3>
                          <p className="text-sm text-gray-600">{quiz.category}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border-2 shadow-sm ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl shadow-sm ${
                          quiz.isActive 
                            ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 border-2 border-green-300' 
                            : 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-2 border-red-300'
                        }`}>
                          {quiz.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center p-3 backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-white/60 rounded-xl border border-blue-100/50 shadow-sm">
                        <div className="text-xl font-bold text-blue-600">{quiz.questionCount}</div>
                        <div className="text-xs text-gray-600 font-medium">Questions</div>
                      </div>
                      <div className="text-center p-3 backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-white/60 rounded-xl border border-green-100/50 shadow-sm">
                        <div className="text-xl font-bold text-green-600">{quiz.attempts}</div>
                        <div className="text-xs text-gray-600 font-medium">Attempts</div>
                      </div>
                      <div className="text-center p-3 backdrop-blur-xl bg-gradient-to-br from-purple-50/80 to-white/60 rounded-xl border border-purple-100/50 shadow-sm">
                        <div className="text-xl font-bold text-purple-600">{quiz.completions}</div>
                        <div className="text-xs text-gray-600 font-medium">Completions</div>
                      </div>
                      <div className="text-center p-3 backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-white/60 rounded-xl border border-blue-100/50 shadow-sm">
                        <div className="text-xl font-bold text-blue-600">{quiz.averageScore}%</div>
                        <div className="text-xs text-gray-600 font-medium">Avg Score</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <div className="flex justify-between">
                        <span>Points:</span>
                        <span className="font-medium">{quiz.points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Limit:</span>
                        <span className="font-medium">{quiz.timeLimit} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Passing Score:</span>
                        <span className="font-medium">{quiz.passingScore}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleQuizStatus(quiz.id, quiz.isActive)}
                          className={`p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110 ${
                            quiz.isActive 
                              ? 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600 hover:from-orange-200 hover:to-orange-300' 
                              : 'bg-gradient-to-br from-green-100 to-green-200 text-green-600 hover:from-green-200 hover:to-green-300'
                          }`}
                          title={quiz.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {quiz.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => openEditQuiz(quiz)}
                          className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 hover:from-blue-200 hover:to-blue-300 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110"
                          title="Edit Quiz"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openManageQuestions(quiz)}
                          className="p-2.5 bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 hover:from-purple-200 hover:to-purple-300 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110"
                          title="Add Questions to Quiz"
                        >
                          <QuestionMarkCircleIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        className="p-2.5 bg-gradient-to-br from-red-100 to-red-200 text-red-600 hover:from-red-200 hover:to-red-300 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-110"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Quiz Modal - iOS 26 Glassy Style */}
        {showCreateQuiz && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200/50">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 shadow-lg shadow-blue-500/50 mr-3">
                    <AcademicCapIcon className="w-6 h-6 text-white" />
                  </div>
                  {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                </h3>
                <p className="text-gray-600 mt-2 ml-14">
                  {editingQuiz ? 'Update the quiz details' : 'Create a new quiz for your electrical knowledge system'}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white/30">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Quiz Title</label>
                    <input
                      type="text"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                      placeholder="Enter quiz title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                    <textarea
                      value={quizForm.description}
                      onChange={(e) => setQuizForm({...quizForm, description: e.target.value})}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                      rows={3}
                      placeholder="Enter quiz description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
                      <select 
                        value={quizForm.category}
                        onChange={(e) => setQuizForm({...quizForm, category: e.target.value})}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                      >
                        {categories.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Difficulty</label>
                      <select 
                        value={quizForm.difficulty}
                        onChange={(e) => setQuizForm({...quizForm, difficulty: e.target.value})}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                      >
                        {difficulties.slice(1).map(difficulty => (
                          <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Time Limit (min)</label>
                      <input
                        type="number"
                        value={quizForm.timeLimit}
                        onChange={(e) => setQuizForm({...quizForm, timeLimit: parseInt(e.target.value) || 15})}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Passing Score (%)</label>
                      <input
                        type="number"
                        value={quizForm.passingScore}
                        onChange={(e) => setQuizForm({...quizForm, passingScore: parseInt(e.target.value) || 70})}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                        placeholder="70"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Points Awarded</label>
                      <input
                        type="number"
                        value={quizForm.points}
                        onChange={(e) => setQuizForm({...quizForm, points: parseInt(e.target.value) || 10})}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                        placeholder="10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200/50 bg-gradient-to-br from-white/30 to-gray-50/50 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateQuiz(false);
                    setEditingQuiz(null);
                    setQuizForm({
                      title: '',
                      description: '',
                      category: 'Lighting',
                      difficulty: 'Beginner',
                      points: 10,
                      timeLimit: 15,
                      passingScore: 70,
                      tags: ['']
                    });
                  }}
                  className="px-6 py-3 text-gray-700 backdrop-blur-xl bg-gray-100/80 rounded-2xl hover:bg-gray-200/80 transition-all shadow-sm hover:shadow-md font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={editingQuiz ? updateQuiz : createQuiz}
                  className="px-6 py-3 backdrop-blur-xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                >
                  {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Questions for Quiz Modal - iOS 26 Glassy Style */}
        {showManageQuestions && selectedQuiz && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200/50">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 rounded-2xl bg-gradient-to-br from-purple-500/90 to-indigo-600/90 shadow-lg shadow-purple-500/50 mr-3">
                    <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  Manage Questions for - {selectedQuiz.title}
                </h3>
                <p className="text-gray-600 mt-2 ml-14">Create new questions and manage existing questions in this quiz</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Create New Question Form */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="text-blue-500 mr-2">✨</span>
                      Create New Question
                    </h4>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Question Text</label>
                        <textarea
                          value={questionForm.question}
                          onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                          className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                          rows={3}
                          placeholder="Enter your question here..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Question Type</label>
                        <select
                          value={questionForm.type}
                          onChange={(e) => setQuestionForm({...questionForm, type: e.target.value as any})}
                          className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="multiple_select">Multiple Select</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
                          <select
                            value={questionForm.category}
                            onChange={(e) => setQuestionForm({...questionForm, category: e.target.value})}
                            className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                          >
                            {categories.slice(1).map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Difficulty</label>
                          <select
                            value={questionForm.difficulty}
                            onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value})}
                            className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                          >
                            {difficulties.slice(1).map(difficulty => (
                              <option key={difficulty} value={difficulty}>{difficulty}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Points</label>
                        <input
                          type="number"
                          value={questionForm.points}
                          onChange={(e) => setQuestionForm({...questionForm, points: parseInt(e.target.value) || 1})}
                          className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                          placeholder="1"
                          min="1"
                        />
                      </div>

                      {/* Options for Multiple Choice */}
                      {questionForm.type === 'multiple_choice' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Answer Options</label>
                          <div className="space-y-2">
                            {questionForm.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={questionForm.correctAnswer === index}
                                  onChange={() => setQuestionForm({...questionForm, correctAnswer: index})}
                                  className="text-blue-600"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...questionForm.options];
                                    newOptions[index] = e.target.value;
                                    setQuestionForm({...questionForm, options: newOptions});
                                  }}
                                  className="flex-1 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                                  placeholder={`Option ${index + 1}`}
                                />
                                <button
                                  onClick={() => {
                                    const newOptions = questionForm.options.filter((_, i) => i !== index);
                                    setQuestionForm({...questionForm, options: newOptions});
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => setQuestionForm({...questionForm, options: [...questionForm.options, '']})}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Add Option
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Options for True/False */}
                      {questionForm.type === 'true_false' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Correct Answer</label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={questionForm.correctAnswer === 0}
                                onChange={() => setQuestionForm({...questionForm, correctAnswer: 0})}
                                className="text-blue-600"
                              />
                              <span className="ml-2">True</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={questionForm.correctAnswer === 1}
                                onChange={() => setQuestionForm({...questionForm, correctAnswer: 1})}
                                className="text-blue-600"
                              />
                              <span className="ml-2">False</span>
                            </label>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Explanation (Optional)</label>
                        <textarea
                          value={questionForm.explanation}
                          onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                          className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                          rows={2}
                          placeholder="Explain why this answer is correct..."
                        />
                      </div>

                      <button
                        onClick={createQuestionForQuiz}
                        className="w-full backdrop-blur-xl bg-gradient-to-br from-purple-500/90 to-indigo-600/90 text-white py-3 px-6 rounded-2xl hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                      >
                        ✨ Add Question to Quiz
                      </button>
                    </div>
                  </div>

                  {/* Quiz Questions */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Existing Questions ({selectedQuiz.questions?.length || 0})</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedQuiz.questions?.map((questionIdOrObject: any) => {
                        // Handle both string IDs and question objects
                        const questionId = typeof questionIdOrObject === 'string' 
                          ? questionIdOrObject 
                          : questionIdOrObject.id || questionIdOrObject._id;
                        const question = typeof questionIdOrObject === 'object' 
                          ? questionIdOrObject 
                          : questions.find(q => q.id === questionId || q._id === questionId);
                        if (!question) {
                          return (
                            <div key={questionId || 'unknown'} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 mb-2">Question ID: {questionId}</p>
                                  <p className="text-xs text-yellow-600">Question details not found. This question may have been deleted.</p>
                                </div>
                                <div className="flex space-x-2">
                                <button
                                  onClick={() => removeQuestionFromQuiz(selectedQuiz.id, questionId || 'unknown')}
                                  className="px-3 py-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-sm rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 font-medium"
                                >
                                  Remove
                                </button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={questionId || question.id || question._id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-2">{question.question}</p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{question.category}</span>
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{question.difficulty}</span>
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{question.type}</span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openEditQuestion(question)}
                                  className="px-3 py-1.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105 font-medium"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => removeQuestionFromQuiz(selectedQuiz.id, questionId || question.id || question._id)}
                                  className="px-3 py-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-sm rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {(!selectedQuiz.questions || selectedQuiz.questions.length === 0) && (
                        <p className="text-gray-500 text-center py-4">No questions in this quiz yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200/50 bg-gradient-to-br from-white/30 to-gray-50/50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowManageQuestions(false)}
                  className="px-6 py-3 text-gray-700 backdrop-blur-xl bg-gray-100/80 rounded-2xl hover:bg-gray-200/80 transition-all shadow-sm hover:shadow-md font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Question Modal - iOS 26 Glassy Style */}
        {showEditQuestion && editingQuestion && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl border-2 border-white/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200/50">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500/90 to-cyan-600/90 shadow-lg shadow-blue-500/50 mr-3">
                    <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  Edit Question
                </h3>
                <p className="text-gray-600 mt-2 ml-14">Update the question details</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white/30">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Question Text</label>
                    <textarea
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      rows={3}
                      placeholder="Enter your question here..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Question Type</label>
                    <select
                      value={questionForm.type}
                      onChange={(e) => setQuestionForm({...questionForm, type: e.target.value as any})}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                      <option value="multiple_select">Multiple Select</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
                      <select
                        value={questionForm.category}
                        onChange={(e) => setQuestionForm({...questionForm, category: e.target.value})}
                        className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      >
                        {categories.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Difficulty</label>
                      <select
                        value={questionForm.difficulty}
                        onChange={(e) => setQuestionForm({...questionForm, difficulty: e.target.value})}
                        className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      >
                        {difficulties.slice(1).map(difficulty => (
                          <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Points</label>
                    <input
                      type="number"
                      value={questionForm.points}
                      onChange={(e) => setQuestionForm({...questionForm, points: parseInt(e.target.value) || 1})}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  {/* Options for Multiple Choice */}
                  {questionForm.type === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Answer Options</label>
                      <div className="space-y-2">
                        {questionForm.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={questionForm.correctAnswer === index}
                              onChange={() => setQuestionForm({...questionForm, correctAnswer: index})}
                              className="text-blue-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options];
                                newOptions[index] = e.target.value;
                                setQuestionForm({...questionForm, options: newOptions});
                              }}
                              className="flex-1 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                              placeholder={`Option ${index + 1}`}
                            />
                            <button
                              onClick={() => {
                                const newOptions = questionForm.options.filter((_, i) => i !== index);
                                setQuestionForm({...questionForm, options: newOptions});
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setQuestionForm({...questionForm, options: [...questionForm.options, '']})}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Options for True/False */}
                  {questionForm.type === 'true_false' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Correct Answer</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={questionForm.correctAnswer === 0}
                            onChange={() => setQuestionForm({...questionForm, correctAnswer: 0})}
                            className="text-blue-600"
                          />
                          <span className="ml-2">True</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={questionForm.correctAnswer === 1}
                            onChange={() => setQuestionForm({...questionForm, correctAnswer: 1})}
                            className="text-blue-600"
                          />
                          <span className="ml-2">False</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Explanation (Optional)</label>
                    <textarea
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                      className="w-full backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
                      rows={2}
                      placeholder="Explain why this answer is correct..."
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200/50 bg-gradient-to-br from-white/30 to-gray-50/50 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditQuestion(false);
                    setEditingQuestion(null);
                    setQuestionForm({
                      question: '',
                      type: 'multiple_choice',
                      category: 'Lighting',
                      difficulty: 'Beginner',
                      points: 1,
                      options: ['', ''],
                      correctAnswer: 0,
                      explanation: ''
                    });
                  }}
                  className="px-6 py-3 text-gray-700 backdrop-blur-xl bg-gray-100/80 rounded-2xl hover:bg-gray-200/80 transition-all shadow-sm hover:shadow-md font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={updateQuestion}
                  className="px-6 py-3 backdrop-blur-xl bg-gradient-to-br from-blue-500/90 to-cyan-600/90 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                >
                  Update Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Back Button for Mobile */}
        <div className="fixed bottom-6 right-6 md:hidden z-40">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Go Back"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizManagementPage;
