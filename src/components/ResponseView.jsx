import React, { useState } from 'react';

const ResponseView = ({ response }) => {
  const [activeTab, setActiveTab] = useState('body');

  if (!response) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Response</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">Send a request to see response</p>
            <p className="text-sm mt-1">Response will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  if (response.error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Error</h3>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Request Failed</span>
            </div>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{response.error}</pre>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = response.status >= 200 && response.status < 300 
    ? 'bg-green-100 text-green-800 border-green-200'
    : response.status >= 400 
    ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-yellow-100 text-yellow-800 border-yellow-200';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Response Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${response.status >= 200 && response.status < 300 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <h3 className="text-lg font-semibold text-gray-900">Response</h3>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium border rounded-full ${statusColor}`}>
              Status: {response.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 px-6">
          {['body', 'headers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'body' && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <pre className="p-4 text-sm overflow-auto max-h-96">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'headers' && response.headers && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <pre className="p-4 text-sm overflow-auto max-h-96">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseView;