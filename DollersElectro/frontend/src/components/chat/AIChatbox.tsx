import React, { useState, useEffect, useRef } from 'react';
import { aiChatAPI, AIRecommendation } from '../../services/api/aiChatAPI';
import { 
  XMarkIcon, 
  PaperAirplaneIcon,
  LightBulbIcon,
  ShoppingCartIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface AIChatboxProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatbox: React.FC<AIChatboxProps> = ({ isOpen, onClose }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat session
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat();
    }
  }, [isOpen, sessionId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const initializeChat = async () => {
    try {
      const response = await aiChatAPI.startChat();
      if (response.success && response.data) {
        setSessionId(response.data.sessionId);
        setConversation(response.data.conversation);
        setRecommendations(response.data.recommendations || []);
      } else {
        console.error('AI Chat initialization failed:', response);
        setConversation([{
          role: 'assistant',
          message: '🔌 AI Service is currently busy or unavailable. Our AI assistant is temporarily offline. You can still browse products or contact our support team for assistance.',
          timestamp: new Date()
        }]);
      }
    } catch (error: any) {
      console.error('AI Chat error:', error);
      const errorMessage = error.response?.status === 503 
        ? '⏳ Server is busy. Please try again in a few moments.'
        : error.response?.status === 500
        ? '🔧 AI service is experiencing technical difficulties. Our team is working on it.'
        : '🔌 Unable to connect to AI service. Please check your internet connection or try again later.';
      
      setConversation([{
        role: 'assistant',
        message: errorMessage,
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) {
      return;
    }
    
    if (!sessionId) {
      console.warn('No session ID, attempting to reinitialize chat');
      setConversation(prev => [...prev, {
        role: 'assistant',
        message: '🔄 Session expired. Please close and reopen the chat to start a new session.',
        timestamp: new Date()
      }]);
      return;
    }

    setIsLoading(true);
    const userMessage = { role: 'user', message, timestamp: new Date() };
    setConversation(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      console.log('Sending message to AI:', { sessionId, message });
      const response = await aiChatAPI.sendMessage(sessionId, message);
      console.log('AI response:', response);
      
      if (response.success && response.data) {
        console.log('✅ AI Response received');
        console.log('📝 New conversation:', response.data.conversation);
        console.log('🔢 Messages count:', response.data.conversation.length);
        console.log('💡 Last message:', response.data.conversation[response.data.conversation.length - 1]);
        setConversation(response.data.conversation);
        setRecommendations(response.data.recommendations || []);
      } else {
        console.error('AI failed to respond:', response);
        setConversation(prev => [...prev, {
          role: 'assistant',
          message: `Error: ${response.message || 'AI service unavailable. Please try again.'}`,
          timestamp: new Date()
        }]);
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Add user-friendly error message based on error type
      let errorMessage = '';
      if (error.response) {
        switch (error.response.status) {
          case 503:
            errorMessage = '⏳ Server is busy right now. Please wait a moment and try again.';
            break;
          case 500:
            errorMessage = '🔧 AI service encountered an error. Our team is working to fix it. Please try again later.';
            break;
          case 404:
            errorMessage = '❓ AI session not found. Please refresh the page and start a new chat.';
            break;
          default:
            errorMessage = `⚠️ Connection error: ${error.response.data?.message || 'Unable to reach AI service.'}`;
        }
      } else if (error.request) {
        errorMessage = '🌐 No response from server. Please check your internet connection and try again.';
      } else {
        errorMessage = '❌ An unexpected error occurred. Please try again.';
      }
      
      // Add error message to conversation
      setConversation(prev => [...prev, {
        role: 'assistant',
        message: errorMessage,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    sendMessage(suggestion.text);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const clearChat = () => {
    setSessionId(null);
    setConversation([]);
    setRecommendations([]);
    setInputMessage('');
    initializeChat();
  };

  // Debug: Log when component renders
  useEffect(() => {
    if (isOpen) {
      console.log('🤖 AI Chatbox opened');
      console.log('📊 Session ID:', sessionId);
      console.log('💬 Conversation length:', conversation.length);
    }
  }, [isOpen, sessionId, conversation.length]);

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-80 backdrop-blur-1xl bg-white/90 rounded-2xl shadow-1xl border border-white/60 z-50 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">AI Electrical Advisor</span>
            <span className="text-xs bg-white/20 backdrop-blur-xl px-2 py-1 rounded-full font-medium">
              Active
            </span>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-white hover:text-white/80 transition-colors p-1 hover:bg-white/10 rounded-lg"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 text-center">
          <button
            onClick={() => setIsMinimized(false)}
            className="text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-xl backdrop-blur-xl bg-blue-50/60 hover:bg-blue-50/80 border border-blue-200/50 transition-all duration-300"
          >
            Click to expand AI chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 backdrop-blur-2xl bg-white/95 rounded-2xl shadow-2xl border border-white/60 z-50 overflow-hidden">
      {/* Chat Header - iOS Glassy Style */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base">AI Electrical Advisor</h3>
            <p className="text-xs text-white/80">Personalized recommendations</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-white/20 backdrop-blur-xl px-3 py-1 rounded-full font-semibold">
            Smart AI
          </span>
          <button
            onClick={clearChat}
            className="text-white hover:text-white/80 transition-colors p-1.5 hover:bg-white/10 rounded-lg"
            title="New Chat"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:text-white/80 transition-colors p-1.5 hover:bg-white/10 rounded-lg"
            title="Minimize"
          >
            _
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-white/80 transition-colors p-1 hover:bg-white/10 rounded-lg"
            title="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages - iOS iMessage Style */}
      <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white/50">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-2xl p-3.5 max-w-xs shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white'
                  : 'backdrop-blur-xl bg-white/80 text-gray-900 border border-white/60'
              }`}
            >
              <div className="text-sm leading-relaxed">{msg.message}</div>
              
              {/* Suggestions */}
              {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.suggestions.map((suggestion: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left text-xs font-medium backdrop-blur-xl bg-white/40 hover:bg-white/60 rounded-xl px-3 py-2 border border-white/50 hover:border-blue-200/60 transition-all duration-300 text-gray-700 hover:text-blue-600"
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-3.5 border border-white/60 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-700 font-medium">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recommendations - iOS Glassy Style */}
      {recommendations.length > 0 && (
        <div className="p-4 border-t border-white/60 backdrop-blur-xl bg-gradient-to-b from-white/50 to-white/80">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mr-2">
              <LightBulbIcon className="w-4 h-4 text-white" />
            </div>
            Recommended Packages
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recommendations.map((rec, index) => (
              <div key={index} className="backdrop-blur-xl bg-blue-50/60 rounded-xl p-3 border border-blue-200/50 shadow-sm hover:bg-blue-50/80 transition-all duration-300">
                <h5 className="text-sm font-semibold text-blue-900">{rec.packageName}</h5>
                <p className="text-xs text-blue-700 mb-2 font-medium">{rec.category}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-blue-600">
                    <span className="font-bold text-base">${rec.totalPrice}</span>
                    {rec.savings > 0 && (
                      <span className="ml-2 text-green-600 font-semibold">Save ${rec.savings}</span>
                    )}
                  </div>
                  <button className="text-xs bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1.5 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex items-center font-semibold shadow-sm">
                    <ShoppingCartIcon className="w-3 h-3 mr-1" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input - iOS iMessage Style */}
      <div className="p-4 border-t border-white/60 backdrop-blur-xl bg-white/80">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your electrical needs..."
            className="flex-1 px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-sm hover:scale-105 disabled:scale-100"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Quick Start Tips */}
        <div className="mt-3 px-2">
          <p className="text-xs text-gray-600 font-medium">
            <span className="mr-1">💡</span>
            <span className="text-blue-600 font-semibold">Try:</span> "I'm building a house" or "What do I need for my kitchen?"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatbox;
