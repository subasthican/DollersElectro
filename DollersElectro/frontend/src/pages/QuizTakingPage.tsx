import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface Question {
  id: string;
  _id?: string; // MongoDB _id field
  question: string;
  type: 'multiple_choice' | 'true_false' | 'multiple_select';
  options: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
    _id?: string;
    id?: string;
  }[];
  correctAnswer: string[];
  points: number;
  explanation?: string;
  category: string;
  difficulty: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
}

interface QuizAnswer {
  questionId: string;
  selectedAnswers: string[];
  timeSpent: number;
}

const QuizTakingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Define handleSubmitQuiz function first
  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz) return;
    
    setIsSubmitting(true);
    setIsTimerActive(false);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/quiz/${quiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: answers.map(answer => ({
            questionId: answer.questionId,
            selectedAnswers: answer.selectedAnswers,
            timeSpent: answer.timeSpent
          })),
          timeSpent: (quiz.timeLimit * 60) - timeRemaining
        })
      });

      const data = await response.json();
      console.log('Quiz submission response:', data);
      console.log('UserQuiz data:', data.data?.userQuiz);
      
      if (data.success) {
        // Navigate to results page
        navigate(`/quiz/${quiz.id}/results`, { 
          state: { 
            quizData: quiz, 
            userQuiz: data.data.userQuiz,  // Extract userQuiz from nested data
            answers: answers
          } 
        });
      } else {
        setError(data.message || 'Failed to submit quiz');
      }
    } catch (error) {

      setError('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, answers, timeRemaining, navigate]);

  // Initialize quiz and timer
  useEffect(() => {
    if (!id) return;
    
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/quiz/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log('Quiz API response:', data);
        
        if (data.success) {
          console.log('Quiz data:', data.data.quiz);
          console.log('Quiz questions:', data.data.quiz.questions);
          setQuiz(data.data.quiz);
          setTimeRemaining(data.data.quiz.timeLimit * 60); // Convert minutes to seconds
          setIsTimerActive(true);
        } else {
          console.error('Quiz API error:', data.message);
          setError(data.message || 'Failed to load quiz');
        }
      } catch (error) {

        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeRemaining, handleSubmitQuiz]);

  // Track time spent on current question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, selectedAnswers: string[]) => {
    setAnswers(prev => {
      const existingAnswerIndex = prev.findIndex(a => a.questionId === questionId);
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      
      const newAnswer: QuizAnswer = {
        questionId,
        selectedAnswers,
        timeSpent
      };

      if (existingAnswerIndex >= 0) {
        const updated = [...prev];
        updated[existingAnswerIndex] = newAnswer;
        return updated;
      } else {
        return [...prev, newAnswer];
      }
    });
  };

  const getCurrentAnswer = (questionId: string): string[] => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer ? answer.selectedAnswers : [];
  };

  const handleNextQuestion = () => {
    if (quiz?.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const toggleTimer = () => {
    setIsTimerActive(prev => !prev);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Login Required</h2>
          <p className="text-gray-700 mb-6 font-medium">Please log in to take quizzes</p>
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-t-4 border-purple-600 mx-auto shadow-xl"></div>
          <p className="mt-6 text-gray-800 font-bold text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 p-12">
          <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Error</h2>
          <p className="text-gray-700 mb-6 font-medium">{error || 'Quiz not found'}</p>
          <button
            onClick={() => navigate('/quiz')}
            className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
          >
            ⬅️ Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const progress = quiz?.questions?.length ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
  const isLastQuestion = quiz?.questions?.length ? currentQuestionIndex === quiz.questions.length - 1 : false;
  const hasAnswered = currentQuestion ? getCurrentAnswer(currentQuestion.id).length > 0 : false;

  // Handle case where quiz has no questions
  if (!quiz?.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 p-12 max-w-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-5">❌ No Questions Available</h2>
          <p className="text-gray-700 mb-4 font-medium">This quiz doesn't have any questions yet.</p>
          <p className="text-sm text-gray-600 mb-8">Please contact an administrator to add questions to this quiz.</p>
          <button
            onClick={() => navigate('/quiz')}
            className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
          >
            ⬅️ Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Handle case where current question is undefined
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 p-12 max-w-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-5">❌ Question Not Found</h2>
          <p className="text-gray-700 mb-8 font-medium">The requested question could not be found.</p>
          <button
            onClick={() => navigate('/quiz')}
            className="backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-bold text-lg"
          >
            ⬅️ Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - iOS 26 Glassy */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/quiz')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-sm text-gray-600">{quiz.category} • {quiz.difficulty}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span className={timeRemaining < 60 ? 'text-red-600 font-semibold' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <button
                onClick={toggleTimer}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                {isTimerActive ? (
                  <PauseIcon className="h-5 w-5" />
                ) : (
                  <PlayIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {quiz?.questions?.length || 0}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{currentQuestion.points} points</span>
              <span className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                {hasAnswered ? 'Answered' : 'Not answered'}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => {
              const optionText = option.text; // Extract text from option object
              const isSelected = getCurrentAnswer(currentQuestion.id).includes(optionText);
              return (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const currentAnswers = getCurrentAnswer(currentQuestion.id);
                      let newAnswers: string[];
                      
                      if (e.target.checked) {
                        newAnswers = [...currentAnswers, optionText];
                      } else {
                        newAnswers = currentAnswers.filter(a => a !== optionText);
                      }
                      
                      handleAnswerChange(currentQuestion.id, newAnswers);
                    }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 mr-4 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <CheckCircleIcon className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-gray-900">{optionText}</span>
                </label>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Previous
            </button>

            <div className="flex space-x-4">
              {!isLastQuestion ? (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigation</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {quiz?.questions?.map((_, index) => {
              const isAnswered = answers.some(a => a.questionId === quiz.questions?.[index]?.id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTakingPage;
