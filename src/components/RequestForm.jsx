import React, { useState } from 'react';
import { apiService } from '../services/api';

const RequestForm = ({ onResponse, initialData }) => {
  const [formData, setFormData] = useState({
    url: 'https://jsonplaceholder.typicode.com/posts',
    method: 'GET',
    headers: '{"Content-Type": "application/json"}',
    body: '{"title": "foo", "body": "bar", "userId": 1}'
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('params');

  const methods = [
    { value: 'GET', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'POST', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'PUT', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'DELETE', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'PATCH', color: 'bg-purple-100 text-purple-800 border-purple-200' }
  ];

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('🟡 Sending request to:', formData.url);

    try {
      // Prepare request data
      const requestPayload = {
        url: formData.url,
        method: formData.method,
        headers: JSON.parse(formData.headers || '{}'),
        body: formData.method !== 'GET' ? JSON.parse(formData.body || '{}') : undefined
      };

      console.log('🟡 Request payload:', requestPayload);

      const proxyResponse = await apiService.proxyRequest(requestPayload);

      console.log('✅ Request successful:', {
        url: formData.url,
        status: proxyResponse.status,
        hasData: !!proxyResponse.data
      });

      // Pass both response and current form data
      onResponse(proxyResponse, formData);

    } catch (error) {
      console.error('❌ Request failed:', error);
      
      // Even on error, pass both error and current form data
      onResponse({ 
        error: error.error || error.message,
        status: error.status || 500,
        data: null
      }, formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Request Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Method Selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {methods.map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setFormData({...formData, method: method.value})}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  formData.method === method.value 
                    ? `${method.color} shadow-sm` 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {method.value}
              </button>
            ))}
          </div>

          {/* URL Input */}
          <div className="flex-1">
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              placeholder="Enter API URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.url}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 px-6">
          {['params', 'headers', 'body'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'headers' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Request Headers</label>
            <textarea
              value={formData.headers}
              onChange={(e) => setFormData({...formData, headers: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none transition-colors"
              placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
            />
            <p className="text-xs text-gray-500 mt-2">Enter headers as valid JSON</p>
          </div>
        )}

        {activeTab === 'body' && formData.method !== 'GET' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none transition-colors"
              placeholder='{"key": "value"}'
            />
            <p className="text-xs text-gray-500 mt-2">Enter request body as valid JSON</p>
          </div>
        )}

        {activeTab === 'body' && formData.method === 'GET' && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>GET requests don't have a body</p>
          </div>
        )}

        {activeTab === 'params' && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p>Query parameters can be added directly to the URL</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestForm;