import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { messagesAPI } from '../services/api/messagesAPI';
import { toast } from 'react-hot-toast';
import {
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowLeftIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
// import LiveChat from '../components/chat/LiveChat'; // Not needed anymore

interface Message {
  _id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  replies: any[];
  editHistory?: Array<{
    editedAt: string;
    previousMessage: string;
  }>;
}

const MyMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editFormData, setEditFormData] = useState({
    subject: '',
    message: '',
    category: '',
    priority: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyMessages();
  }, [isAuthenticated, navigate]);

  const fetchMyMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getMyMessages();
      if (response.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      toast.error('Failed to load your messages');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (message: Message) => {
    setSelectedMessage(message);
    setEditFormData({
      subject: message.subject,
      message: message.message,
      category: message.category,
      priority: message.priority
    });
    setShowEditModal(true);
  };

  const handleDelete = (message: Message) => {
    setSelectedMessage(message);
    setShowDeleteModal(true);
  };

  const handleViewChat = async (message: Message) => {
    try {
      // Fetch full message details with replies
      const response = await messagesAPI.getMessage(message._id);
      if (response.success) {
        setSelectedMessage(response.data.message as any);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error loading message:', error);
      // Still show the modal with the basic message data we already have
      setSelectedMessage(message);
      setShowViewModal(true);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      const response = await messagesAPI.replyToMessage(selectedMessage._id, {
        message: replyText,
        isInternal: false
      });

      if (response.success) {
        toast.success('Reply sent successfully!');
        setReplyText('');
        // Refresh the message to show the new reply
        const updatedMessage = await messagesAPI.getMessage(selectedMessage._id);
        if (updatedMessage.success) {
          setSelectedMessage(updatedMessage.data.message as any);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reply');
    }
  };

  const confirmEdit = async () => {
    if (!selectedMessage) return;

    try {
      const response = await messagesAPI.updateMessage(selectedMessage._id, editFormData);
      if (response.success) {
        toast.success('Message updated successfully!');
        setShowEditModal(false);
        fetchMyMessages();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update message');
    }
  };

  const confirmDelete = async () => {
    if (!selectedMessage) return;

    try {
      const response = await messagesAPI.deleteMessage(selectedMessage._id);
      if (response.success) {
        toast.success('Message deleted successfully!');
        setShowDeleteModal(false);
        fetchMyMessages();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/contact')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Contact
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                💬 My Messages
              </h1>
              <p className="text-gray-600">
                View and manage your contact messages
              </p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        {messages.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/90 rounded-3xl border-2 border-white/60 shadow-xl p-12 text-center">
            <ChatBubbleLeftRightIcon className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Messages Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't sent any messages. Visit our contact page to send a message!
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Send a Message
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className="backdrop-blur-xl bg-white/90 rounded-2xl border-2 border-white/60 shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {message.subject}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {message.message}
                    </p>
                    
                    {/* Edit History Indicator */}
                    {message.editHistory && message.editHistory.length > 0 && (
                      <div className="mt-2 flex items-center text-sm text-orange-600">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        Edited {message.editHistory.length} time{message.editHistory.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(message.status)}`}>
                      {message.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {new Date(message.createdAt).toLocaleString()}
                    {message.replies && message.replies.length > 0 && (
                      <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewChat(message)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View & Chat"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    
                    {message.status !== 'resolved' && message.status !== 'closed' && (
                      <>
                        <button
                          onClick={() => handleEdit(message)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit Message"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(message)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Message"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/95 rounded-3xl border-2 border-white/60 shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">✏️ Edit Message</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={editFormData.subject}
                  onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={editFormData.message}
                  onChange={(e) => setEditFormData({ ...editFormData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing</option>
                    <option value="product">Product Inquiry</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Note:</strong> Admin will be able to see that this message was edited and view the edit history.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 backdrop-blur-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-white/95 rounded-3xl border-2 border-white/60 shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <TrashIcon className="h-8 w-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Message?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this message? This action cannot be undone.
              </p>

              <div className="bg-gray-100 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {selectedMessage.subject}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 backdrop-blur-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {showViewModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="backdrop-blur-2xl bg-white/95 rounded-3xl border-2 border-white/60 shadow-2xl max-w-4xl w-full my-8">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">💬 Message Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Message Info */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedMessage.status === 'open' ? 'bg-green-100 text-green-800' :
                    selectedMessage.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    selectedMessage.status === 'resolved' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedMessage.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedMessage.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedMessage.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedMessage.priority}
                  </span>
                  <span>
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Original Message */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Message:</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-900">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Replies */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Conversation ({selectedMessage.replies?.length || 0} {selectedMessage.replies?.length === 1 ? 'reply' : 'replies'})
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedMessage.replies && selectedMessage.replies.length > 0 ? (
                    selectedMessage.replies.map((reply: any, index: number) => (
                      <div
                        key={index}
                        className={`rounded-xl p-4 ${
                          reply.user._id === user?.id
                            ? 'bg-blue-50 border-l-4 border-blue-500 ml-8'
                            : 'bg-green-50 border-l-4 border-green-500 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {reply.user._id === user?.id
                              ? 'You'
                              : `${reply.user.firstName} ${reply.user.lastName} (${reply.user.role})`}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{reply.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No replies yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-3 backdrop-blur-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMessagesPage;

