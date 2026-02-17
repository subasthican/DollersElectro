import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector } from '../../store';
import { chatAPI, chatHelpers, ChatMessage, TypingUser } from '../../services/api/chatAPI';
import { messagesAPI } from '../../services/api/messagesAPI';
import { toast } from 'react-hot-toast';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface LiveChatProps {
  messageId: string;
  onClose: () => void;
}

const LiveChat: React.FC<LiveChatProps> = ({ messageId, onClose }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [message, setMessage] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch message data
  const fetchMessage = useCallback(async () => {
    try {
      // Use regular messages API instead of chat API
      const response = await messagesAPI.getMessage(messageId);
      if (response.success) {
        setMessage(response.data.message as any);
        setTypingUsers([]); // No typing users for now
      }
    } catch (error) {
      console.error('Failed to fetch message:', error);
      // Don't show error toast - component is not used anymore
    }
  }, [messageId]);

  // Send reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !message) return;

    setIsSubmitting(true);
    try {
      const response = await messagesAPI.replyToMessage(messageId, {
        message: replyText,
        isInternal: false
      });

      if (response.success) {
        setReplyText('');
        await fetchMessage(); // Refresh to get updated message
        toast.success('Reply sent successfully!');
      }
    } catch (error) {

      toast.error('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle typing status
  const handleTyping = useCallback(async (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      try {
        await chatAPI.updateTypingStatus(messageId, typing);
      } catch (error) {

      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        chatAPI.updateTypingStatus(messageId, false).catch(console.error);
      }, 3000);
    }
  }, [isTyping, messageId]);

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
    handleTyping(e.target.value.length > 0);
  };

  // Set up real-time updates
  useEffect(() => {
    // Initial fetch
    fetchMessage();

    // Set up refresh interval for real-time updates
    refreshIntervalRef.current = setInterval(fetchMessage, 3000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [fetchMessage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [message?.replies]);

  if (!message) {
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200">
        <div className="p-3 bg-blue-600 text-white rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span className="font-medium">Live Chat</span>
            <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 text-center">
          <button
            onClick={() => setIsMinimized(false)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Click to expand chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Chat Header */}
      <div className="p-4 bg-blue-600 text-white rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Live Chat</h3>
            <p className="text-xs text-blue-200">
              {message.subject}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full">
            Active
          </span>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {/* Original Message */}
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
            <div className="text-sm font-medium text-gray-900">
              {message.user.firstName} {message.user.lastName}
            </div>
            <div className="text-sm text-gray-700 mt-1">
              {message.message}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Replies */}
        {message.replies.map((reply, index) => (
          <div
            key={reply._id}
            className={`flex ${reply.user._id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg p-3 max-w-xs ${
                reply.user._id === user?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm font-medium">
                {reply.user._id === user?.id ? 'You' : `${reply.user.firstName} ${reply.user.lastName}`}
                {reply.isInternal && (
                  <span className="ml-2 text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded">
                    Internal
                  </span>
                )}
              </div>
              <div className="text-sm mt-1">
                {reply.message}
              </div>
              <div className={`text-xs mt-2 ${
                reply.user._id === user?.id ? 'text-blue-200' : 'text-gray-500'
              }`}>
                {new Date(reply.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="text-sm text-gray-600 italic">
                {chatHelpers.formatTypingText(typingUsers)}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={replyText}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
            placeholder="Type your reply..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <button
            onClick={handleSendReply}
            disabled={!replyText.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <PaperAirplaneIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Status Info */}
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
          <span>Status: {message.status.replace('_', ' ')}</span>
          <span>Priority: {message.priority}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
