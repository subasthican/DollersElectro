import api from './api';

// Types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  pointsAwarded: number;
  isActive: boolean;
  questionCount: number;
  attempts: number;
  completions: number;
  averageScore: number;
  createdAt: string;
}

export interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  correctAnswerExplanation?: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  points: number;
  isActive: boolean;
  totalAttempts: number;
  correctAttempts: number;
  createdAt: string;
}

export interface UserQuiz {
  id: string;
  user: string;
  quiz: string;
  startTime: string;
  endTime?: string;
  score: number;
  passed: boolean;
  answers: {
    question: string;
    selectedOptions: string[];
    isCorrect: boolean;
    pointsEarned: number;
  }[];
  totalPointsEarned: number;
  status: 'started' | 'completed' | 'abandoned';
}

export enum QuizCategory {
  LIGHTING = 'Lighting',
  TOOLS = 'Tools',
  ELECTRICAL_PANELS = 'Electrical Panels',
  CABLES = 'Cables',
  SWITCHES = 'Switches',
  SENSORS = 'Sensors',
  AUTOMATION = 'Automation',
  SAFETY_EQUIPMENT = 'Safety Equipment',
  TEST_EQUIPMENT = 'Test Equipment',
  GENERAL_ELECTRICAL = 'General Electrical'
}

export enum QuizDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert'
}

export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'True/False',
  MULTIPLE_SELECT = 'Multiple Select'
}

export interface QuizResponse {
  success: boolean;
  message: string;
  data: Quiz[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface QuestionResponse {
  success: boolean;
  message: string;
  data: Question[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface UserQuizResponse {
  success: boolean;
  message: string;
  data: UserQuiz;
  score?: number;
  passed?: boolean;
  totalPointsEarned?: number;
}

export interface UserStatsResponse {
  success: boolean;
  message: string;
  data: {
    quizPoints: number;
    badges: Array<{
      name: string;
      description: string;
      icon: string;
      earnedAt: string;
      category: string;
    }>;
    quizStats: {
      totalQuizzes: number;
      completedQuizzes: number;
      passedQuizzes: number;
      averageScore: number;
      totalTimeSpent: number;
      currentStreak: number;
      longestStreak: number;
    };
  };
}

// Quiz API functions
export const quizAPI = {
  // Get all active quizzes for users
  getQuizzes: async (category?: QuizCategory | '', difficulty?: QuizDifficulty | '', search?: string): Promise<QuizResponse> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    if (search) params.append('search', search);
    
    const response = await api.get(`/quiz?${params.toString()}`);
    return response.data;
  },

  // Get single quiz by ID (for users)
  getQuizById: async (quizId: string): Promise<{ success: boolean; message: string; data: Quiz }> => {
    const response = await api.get(`/quiz/${quizId}`);
    return response.data;
  },

  // Start a quiz session
  startQuiz: async (quizId: string): Promise<UserQuizResponse> => {
    const response = await api.post(`/quiz/${quizId}/start`);
    return response.data;
  },

  // Submit quiz answers
  submitQuiz: async (quizId: string, userQuizId: string, answers: Array<{ questionId: string; selectedOptions: string[] }>): Promise<UserQuizResponse> => {
    const response = await api.post(`/quiz/${quizId}/submit`, {
      userQuizId,
      answers
    });
    return response.data;
  },

  // Get user's quiz history
  getUserQuizHistory: async (): Promise<{ success: boolean; message: string; data: UserQuiz[] }> => {
    const response = await api.get('/quiz/user/history');
    return response.data;
  },

  // Get user's quiz stats and badges
  getUserStats: async (): Promise<UserStatsResponse> => {
    const response = await api.get('/quiz/user/stats');
    return response.data;
  },

  // Admin functions
  // Get all quizzes (admin)
  getAdminQuizzes: async (page = 1, limit = 10, category?: string, difficulty?: string, search?: string): Promise<QuizResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    if (search) params.append('search', search);
    
    const response = await api.get(`/quiz/admin?${params.toString()}`);
    return response.data;
  },

  // Get single quiz by ID (admin)
  getAdminQuizById: async (quizId: string): Promise<{ success: boolean; message: string; data: Quiz }> => {
    const response = await api.get(`/quiz/admin/${quizId}`);
    return response.data;
  },

  // Create new quiz (admin)
  createQuiz: async (quizData: Partial<Quiz>): Promise<{ success: boolean; message: string; data: Quiz }> => {
    const response = await api.post('/quiz/admin', quizData);
    return response.data;
  },

  // Update quiz (admin)
  updateQuiz: async (quizId: string, quizData: Partial<Quiz>): Promise<{ success: boolean; message: string; data: Quiz }> => {
    const response = await api.put(`/quiz/admin/${quizId}`, quizData);
    return response.data;
  },

  // Delete quiz (admin)
  deleteQuiz: async (quizId: string): Promise<{ success: boolean; message: string; data: Quiz }> => {
    const response = await api.delete(`/quiz/admin/${quizId}`);
    return response.data;
  },

  // Question management (admin)
  // Get all questions (admin)
  getAdminQuestions: async (page = 1, limit = 10, category?: string, difficulty?: string, search?: string, quizId?: string): Promise<QuestionResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    if (search) params.append('search', search);
    if (quizId) params.append('quizId', quizId);
    
    const response = await api.get(`/quiz/admin/questions?${params.toString()}`);
    return response.data;
  },

  // Get single question by ID (admin)
  getAdminQuestionById: async (questionId: string): Promise<{ success: boolean; message: string; data: Question }> => {
    const response = await api.get(`/quiz/admin/questions/${questionId}`);
    return response.data;
  },

  // Create new question (admin)
  createQuestion: async (questionData: Partial<Question>): Promise<{ success: boolean; message: string; data: Question }> => {
    const response = await api.post('/quiz/admin/questions', questionData);
    return response.data;
  },

  // Update question (admin)
  updateQuestion: async (questionId: string, questionData: Partial<Question>): Promise<{ success: boolean; message: string; data: Question }> => {
    const response = await api.put(`/quiz/admin/questions/${questionId}`, questionData);
    return response.data;
  },

  // Delete question (admin)
  deleteQuestion: async (questionId: string): Promise<{ success: boolean; message: string; data: Question }> => {
    const response = await api.delete(`/quiz/admin/questions/${questionId}`);
    return response.data;
  }
};

export default quizAPI;
