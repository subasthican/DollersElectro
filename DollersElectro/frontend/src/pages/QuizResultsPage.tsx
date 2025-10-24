import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { 
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowPathIcon
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

interface UserQuiz {
  id: string;
  score: number;
  totalPoints: number;
  timeSpent: number;
  isPassed: boolean;
  completedAt: string;
  answers: Array<{
    question: string;
    selectedAnswers: string[];
    isCorrect: boolean;
    points: number;
    timeSpent: number;
  }>;
}

const QuizResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const { quizData, userQuiz } = location.state as {
    quizData: Quiz;
    userQuiz: UserQuiz;
    answers: QuizAnswer[];
  } || {};

  console.log('QuizResultsPage received data:', { quizData, userQuiz });
  console.log('UserQuiz answers:', userQuiz?.answers);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Login Required</h2>
          <p className="text-gray-700 mb-6 font-medium">Please log in to view quiz results</p>
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

  if (!quizData || !userQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 p-12">
          <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Results Not Found</h2>
          <p className="text-gray-700 mb-6 font-medium">Quiz results could not be loaded</p>
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

  // Additional safety check for answers array
  if (!userQuiz.answers || !Array.isArray(userQuiz.answers)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border-2 border-white/60 p-12">
          <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Invalid Results Data</h2>
          <p className="text-gray-700 mb-6 font-medium">Quiz answers data is missing or invalid</p>
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= passingScore) {
      return 'text-green-600';
    } else if (score >= passingScore * 0.8) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  const getScoreBgColor = (score: number, passingScore: number) => {
    if (score >= passingScore) {
      return 'bg-green-100';
    } else if (score >= passingScore * 0.8) {
      return 'bg-yellow-100';
    } else {
      return 'bg-red-100';
    }
  };

  const correctAnswers = userQuiz.answers?.filter(answer => answer.isCorrect).length || 0;
  const totalQuestions = quizData.questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/quiz')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
                <p className="text-gray-600">{quizData.title}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(`/quiz/${quizData.id}`)}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold mb-4 ${getScoreBgColor(userQuiz.score, quizData.passingScore)} ${getScoreColor(userQuiz.score, quizData.passingScore)}`}>
              {userQuiz.score}%
            </div>
            
            <h2 className={`text-3xl font-bold mb-2 ${getScoreColor(userQuiz.score, quizData.passingScore)}`}>
              {userQuiz.isPassed ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              {userQuiz.isPassed 
                ? `You passed with ${userQuiz.score}%! Great job!`
                : `You scored ${userQuiz.score}%. You need ${quizData.passingScore}% to pass.`
              }
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{correctAnswers}/{totalQuestions}</div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userQuiz.totalPoints}</div>
                <div className="text-sm text-gray-500">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatTime(userQuiz.timeSpent)}</div>
                <div className="text-sm text-gray-500">Time Taken</div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Answer Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Correct Answers
              </h4>
              <p className="text-green-700 text-sm">
                You got {correctAnswers} out of {totalQuestions} questions correct
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Performance
              </h4>
              <p className="text-blue-700 text-sm">
                {userQuiz.isPassed ? 'You passed!' : 'Keep studying to improve!'}
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Answer Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded mr-3"></div>
              <span className="text-sm text-gray-700">Correct Answer</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded mr-3"></div>
              <span className="text-sm text-gray-700">Your Wrong Answer</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded mr-3"></div>
              <span className="text-sm text-gray-700">Other Options</span>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Question Review</h3>
          
          <div className="space-y-6">
            {quizData.questions.map((question, index) => {
              console.log(`Question ${index + 1}:`, question);
              console.log(`Question correctAnswer:`, question.correctAnswer);
              console.log(`Question options:`, question.options);
              
              const userAnswer = userQuiz.answers?.find(a => a.question === question.question);
              const isCorrect = userAnswer?.isCorrect || false;
              const selectedAnswers = userAnswer?.selectedAnswers || [];
              
              // Try different ways to get correct answers
              let correctAnswers = question.correctAnswer || [];
              
              // If correctAnswer is empty, try to get it from options
              if (correctAnswers.length === 0 && question.options) {
                correctAnswers = question.options
                  .filter(option => option.isCorrect)
                  .map(option => option.text);
              }
              
              console.log(`Processed correctAnswers:`, correctAnswers);
              
              return (
                <div key={question.id} className={`border-2 rounded-lg p-6 ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Question {index + 1}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {isCorrect ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {userAnswer?.points || 0} / {question.points} pts
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-900 mb-4">{question.question}</p>
                  
                  {/* Correct Answer Summary */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Correct Answer{correctAnswers.length > 1 ? 's' : ''}:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {correctAnswers.length > 0 ? correctAnswers.map((answer, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {answer}
                        </span>
                      )) : (
                        <div className="text-red-600 text-sm">
                          <p className="italic mb-2">No correct answers found in data</p>
                          <p className="text-xs">This might be a data issue. Check console for details.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {question.options?.length > 0 ? question.options.map((option, optionIndex) => {
                      const optionText = option.text; // Extract text from option object
                      const isSelected = selectedAnswers.includes(optionText);
                      const isCorrectAnswer = correctAnswers?.includes(optionText) || false;
                      
                      let optionClass = 'p-3 rounded-lg border-2 relative ';
                      if (isCorrectAnswer) {
                        optionClass += 'border-green-500 bg-green-100 text-green-800';
                      } else if (isSelected && !isCorrectAnswer) {
                        optionClass += 'border-red-500 bg-red-100 text-red-800';
                      } else {
                        optionClass += 'border-gray-200 bg-gray-50 text-gray-700';
                      }
                      
                      return (
                        <div key={optionIndex} className={optionClass}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="mr-3 font-medium">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <span>{optionText}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isCorrectAnswer && (
                                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded">
                                  Correct
                                </span>
                              )}
                              {isSelected && (
                                <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded">
                                  Your Answer
                                </span>
                              )}
                              {isCorrectAnswer && (
                                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                              )}
                              {isSelected && !isCorrectAnswer && (
                                <XCircleIcon className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="p-4 text-gray-500 text-center">
                        No options available for this question
                      </div>
                    )}
                  </div>
                  
                  {question.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">Explanation:</h5>
                      <p className="text-blue-800">{question.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/quiz')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Quizzes
          </button>
          <button
            onClick={() => navigate(`/quiz/${quizData.id}`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
