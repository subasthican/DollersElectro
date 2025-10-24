import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  VideoCameraIcon,
  EllipsisVerticalIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
  id: string;
  customerName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isCustomer: boolean;
  avatar?: string;
}

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  priority: 'low' | 'medium' | 'high';
}

const EmployeeChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      customerName: 'Alex Turner',
      customerEmail: 'alex@example.com',
      status: 'online',
      lastMessage: 'Hi, I need help with my order #ORD-001',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      priority: 'medium'
    },
    {
      id: '2',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      status: 'online',
      lastMessage: 'Can you help me with installation?',
      lastMessageTime: '5 min ago',
      unreadCount: 1,
      priority: 'high'
    },
    {
      id: '3',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      status: 'away',
      lastMessage: 'Thanks for the help!',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      priority: 'low'
    }
  ]);

  const [chatMessages] = useState<{ [key: string]: ChatMessage[] }>({
    '1': [
      {
        id: '1',
        customerName: 'Alex Turner',
        message: 'Hi, I need help with my order #ORD-001',
        timestamp: '2024-01-15T15:30:00Z',
        isRead: false,
        isCustomer: true
      },
      {
        id: '2',
        customerName: 'Employee',
        message: 'Hello Alex! I\'d be happy to help you with your order. Can you tell me what specific issue you\'re experiencing?',
        timestamp: '2024-01-15T15:32:00Z',
        isRead: true,
        isCustomer: false
      },
      {
        id: '3',
        customerName: 'Alex Turner',
        message: 'The tracking shows it\'s been delivered but I haven\'t received it yet',
        timestamp: '2024-01-15T15:35:00Z',
        isRead: false,
        isCustomer: true
      }
    ],
    '2': [
      {
        id: '1',
        customerName: 'Sarah Wilson',
        message: 'Can you help me with installation?',
        timestamp: '2024-01-15T15:25:00Z',
        isRead: false,
        isCustomer: true
      }
    ],
    '3': [
      {
        id: '1',
        customerName: 'Mike Johnson',
        message: 'Thanks for the help!',
        timestamp: '2024-01-15T14:30:00Z',
        isRead: true,
        isCustomer: true
      }
    ]
  });

  const sendMessage = () => {
    if (!messageInput.trim() || !activeChat) return;

    // In a real app, this would be sent to the backend
    // const message: ChatMessage = {
    //   id: Date.now().toString(),
    //   customerName: 'Employee',
    //   message: messageInput,
    //   timestamp: new Date().toISOString(),
    //   isRead: false,
    //   isCustomer: false
    // };

    setMessageInput('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - iOS 26 Glassy Style */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Breadcrumb */}
          <div className="py-4 border-b border-gray-200">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button
                onClick={() => navigate('/employee')}
                className="flex items-center hover:text-gray-700 transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Employee Dashboard
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Live Chat</span>
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
              <h1 className="text-xl font-bold text-gray-900">Live Chat</h1>
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
                    <ChatBubbleLeftRightIcon className="w-8 h-8 mr-3 text-blue-600" />
                    Live Chat
                  </h1>
                  <p className="text-gray-600 mt-1">Manage customer conversations and support requests</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, Employee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="backdrop-blur-2xl bg-white/80 shadow-2xl rounded-3xl border-2 border-white/60 h-[600px] flex overflow-hidden">
          {/* Chat Sessions Sidebar - iOS 26 Glassy */}
          <div className="w-1/3 border-r border-white/60 backdrop-blur-xl bg-gradient-to-b from-gray-50/50 to-white/50">
            <div className="p-4 border-b border-white/60 backdrop-blur-xl bg-gradient-to-r from-gray-50/80 to-white/60">
              <h3 className="text-lg font-bold text-gray-900">💬 Active Chats</h3>
              <p className="text-sm font-medium text-gray-600">{chatSessions.filter(c => c.status === 'online').length} customers online</p>
            </div>
            
            <div className="overflow-y-auto h-full">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setActiveChat(session.id)}
                  className={`p-4 border-b border-white/40 cursor-pointer transition-all duration-300 ${
                    activeChat === session.id 
                      ? 'backdrop-blur-xl bg-blue-50/80 border-blue-200/60 shadow-lg shadow-blue-500/10' 
                      : 'hover:backdrop-blur-xl hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/90 to-blue-600/90 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                          <span className="text-white text-sm font-bold">
                            {session.customerName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(session.status)} rounded-full border-2 border-white shadow-lg`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-gray-900">{session.customerName}</h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getPriorityColor(session.priority)}`}>
                            {session.priority}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 truncate">{session.lastMessage}</p>
                        <p className="text-xs font-medium text-gray-500">{session.lastMessageTime}</p>
                      </div>
                    </div>
                    {session.unreadCount > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {session.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages - iOS 26 Glassy */}
          <div className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                {/* Chat Header - iOS 26 Glassy */}
                <div className="p-4 border-b border-white/60 backdrop-blur-xl bg-gradient-to-r from-white/60 to-white/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/90 to-blue-600/90 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-white text-sm font-bold">
                          {chatSessions.find(s => s.id === activeChat)?.customerName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          {chatSessions.find(s => s.id === activeChat)?.customerName}
                        </h3>
                        <p className="text-sm font-medium text-gray-600">
                          {chatSessions.find(s => s.id === activeChat)?.customerEmail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-gray-900 rounded-xl backdrop-blur-xl hover:bg-white/60 transition-all duration-300">
                        <PhoneIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 rounded-xl backdrop-blur-xl hover:bg-white/60 transition-all duration-300">
                        <VideoCameraIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 rounded-xl backdrop-blur-xl hover:bg-white/60 transition-all duration-300">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages - iOS 26 Glassy */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 backdrop-blur-xl bg-gradient-to-b from-white/40 to-white/20">
                  {chatMessages[activeChat]?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isCustomer ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                        message.isCustomer
                          ? 'backdrop-blur-xl bg-white/80 border border-white/60 text-gray-900'
                          : 'bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white shadow-blue-500/30'
                      }`}>
                        <p className="text-sm font-medium">{message.message}</p>
                        <p className={`text-xs mt-1 font-medium ${
                          message.isCustomer ? 'text-gray-500' : 'text-blue-100'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input - iOS 26 Glassy */}
                <div className="p-4 border-t border-white/60 backdrop-blur-xl bg-gradient-to-r from-white/60 to-white/40">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium"
                    />
                    <button
                      onClick={sendMessage}
                      className="px-5 py-3 bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center backdrop-blur-xl bg-gradient-to-b from-white/40 to-white/20">
                <div className="text-center">
                  <div className="w-20 h-20 backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border-2 border-white/60">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">💬 Select a chat to start messaging</h3>
                  <p className="text-gray-600 font-medium">Choose a customer from the left sidebar to begin a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeChatPage;
