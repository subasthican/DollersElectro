import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { messagesAPI } from '../services/api/messagesAPI';
import { toast } from 'react-hot-toast';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to send a message');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await messagesAPI.sendContactMessage(formData);
      
      if (response.success) {
        toast.success('Message sent successfully! Check "My Messages" to see replies.');
        setFormData({
          subject: '',
          message: '',
          category: 'general',
          priority: 'medium'
        });
      } else {
        toast.error(response.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Matching Categories Style */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
          <div className="mb-6">
            <span className="inline-block px-6 py-2 backdrop-blur-xl bg-blue-500/10 border-2 border-blue-500/20 rounded-full text-blue-600 font-semibold text-sm mb-6">
              💬 Contact Us
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Have questions? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form & Info - Apple Style Split */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form - Clean Apple Style */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Send us a message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                    placeholder="How can we help?"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 cursor-pointer appearance-none pr-10"
                    >
                      <option value="general">💬 General Inquiry</option>
                      <option value="technical">🔧 Technical Support</option>
                      <option value="sales">💰 Sales Question</option>
                      <option value="support">🎧 Customer Support</option>
                      <option value="complaint">⚠️ Complaint</option>
                      <option value="feedback">⭐ Feedback</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 cursor-pointer appearance-none pr-10"
                    >
                      <option value="low">🟢 Low - General question</option>
                      <option value="medium">🟡 Medium - Need assistance</option>
                      <option value="high">🟠 High - Important issue</option>
                      <option value="urgent">🔴 Urgent - Requires immediate attention</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-900 placeholder-gray-400"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {/* Submit Button - Apple Style */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isAuthenticated}
                  className="w-full bg-blue-600 text-white py-3.5 px-6 rounded-xl font-semibold text-base
                           hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? 'Sending...' : !isAuthenticated ? 'Login to Send' : 'Send Message'}
                </button>
              </form>

              {/* My Messages Link */}
              {isAuthenticated && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate('/my-messages')}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                  >
                    📧 View My Messages
                  </button>
                </div>
              )}
            </div>

            {/* Contact Information - Clean Cards */}
            <div className="space-y-5">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Contact Information
              </h2>

              {/* Email Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Email</div>
                <a href="mailto:support@dollerselectro.com" className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  support@dollerselectro.com
                </a>
              </div>

              {/* Phone Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Phone</div>
                <a href="tel:0770632559" className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  077 063 2559
                </a>
              </div>

              {/* Address Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Visit Us</div>
                <p className="text-lg font-medium text-gray-900">
                  11 Stanley Rd, Jaffna
                </p>
              </div>

              {/* Hours Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Business Hours</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-900">
                    <span className="font-medium">Monday - Thursday</span>
                    <span className="font-semibold">8AM - 7:30PM</span>
                  </div>
                  <div className="flex justify-between text-gray-900">
                    <span className="font-medium">Friday - Saturday</span>
                    <span className="font-semibold">8AM - 7:30PM</span>
                  </div>
                  <div className="flex justify-between text-gray-900">
                    <span className="font-medium">Sunday</span>
                    <span className="font-semibold text-red-600">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
