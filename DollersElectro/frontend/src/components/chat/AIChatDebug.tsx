import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import { aiChatAPI } from '../../services/api/aiChatAPI';

/**
 * AI Chat Debug Component
 * Add this temporarily to your page to debug AI chat issues
 */
const AIChatDebug: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [testResults, setTestResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results: any = {};

    // Test 1: Check authentication
    results.auth = {
      isAuthenticated,
      userRole: user?.role,
      userName: user?.firstName || user?.email,
      userId: user?.id
    };

    // Test 2: Check backend connection
    try {
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      results.backend = {
        status: 'connected',
        data: healthData
      };
    } catch (error: any) {
      results.backend = {
        status: 'error',
        message: error.message
      };
    }

    // Test 3: Try to start AI chat
    try {
      const chatResponse = await aiChatAPI.startChat();
      results.aiChat = {
        status: 'success',
        sessionId: chatResponse.data?.sessionId,
        hasConversation: !!chatResponse.data?.conversation,
        conversationLength: chatResponse.data?.conversation?.length || 0
      };
    } catch (error: any) {
      results.aiChat = {
        status: 'error',
        message: error.message,
        response: error.response?.data
      };
    }

    setTestResults(results);
    setTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="fixed bottom-20 right-4 w-96 backdrop-blur-2xl bg-white/95 rounded-2xl shadow-2xl border-2 border-white/60 z-50 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
        <h3 className="font-bold text-lg">🔧 AI Chat Diagnostics</h3>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        <button
          onClick={runTests}
          disabled={testing}
          className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {testing ? '🔄 Testing...' : '🔄 Run Tests'}
        </button>

        {/* Authentication Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">1️⃣ Authentication</h4>
          <div className="text-xs space-y-1">
            <p>Logged in: <span className={testResults.auth?.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {testResults.auth?.isAuthenticated ? '✅ Yes' : '❌ No'}
            </span></p>
            <p>Role: <span className="font-mono">{testResults.auth?.userRole || 'None'}</span></p>
            <p>User: <span className="font-mono">{testResults.auth?.userName || 'Unknown'}</span></p>
            {testResults.auth?.userRole !== 'customer' && (
              <p className="text-orange-600 mt-2">⚠️ AI Chat only works for CUSTOMERS</p>
            )}
          </div>
        </div>

        {/* Backend Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">2️⃣ Backend Connection</h4>
          <div className="text-xs space-y-1">
            <p>Status: <span className={testResults.backend?.status === 'connected' ? 'text-green-600' : 'text-red-600'}>
              {testResults.backend?.status === 'connected' ? '✅ Connected' : '❌ Disconnected'}
            </span></p>
            {testResults.backend?.data && (
              <p className="text-gray-600">DB: {testResults.backend.data.database}</p>
            )}
            {testResults.backend?.message && (
              <p className="text-red-600">{testResults.backend.message}</p>
            )}
          </div>
        </div>

        {/* AI Chat Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">3️⃣ AI Chat Service</h4>
          <div className="text-xs space-y-1">
            <p>Status: <span className={testResults.aiChat?.status === 'success' ? 'text-green-600' : 'text-red-600'}>
              {testResults.aiChat?.status === 'success' ? '✅ Working' : '❌ Error'}
            </span></p>
            {testResults.aiChat?.sessionId && (
              <>
                <p className="text-gray-600">Session: {testResults.aiChat.sessionId.substring(0, 8)}...</p>
                <p className="text-gray-600">Messages: {testResults.aiChat.conversationLength}</p>
              </>
            )}
            {testResults.aiChat?.message && (
              <p className="text-red-600 mt-2">Error: {testResults.aiChat.message}</p>
            )}
            {testResults.aiChat?.response && (
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                {JSON.stringify(testResults.aiChat.response, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-sm mb-2">📊 Summary</h4>
          <div className="text-xs space-y-1">
            {testResults.auth?.userRole !== 'customer' && (
              <p className="text-orange-600">⚠️ You must be logged in as a CUSTOMER to use AI chat</p>
            )}
            {testResults.backend?.status !== 'connected' && (
              <p className="text-red-600">❌ Backend is not running. Start it with: npm run dev</p>
            )}
            {testResults.aiChat?.status === 'success' && testResults.auth?.userRole === 'customer' && (
              <p className="text-green-600">✅ AI Chat is ready to use!</p>
            )}
            {testResults.aiChat?.status === 'error' && (
              <p className="text-red-600">❌ AI Chat service has an error. Check backend logs.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatDebug;

