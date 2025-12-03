import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CollectionsProvider } from './context/CollectionsContext';
import Layout from './components/Layout';
import RequestForm from './components/RequestForm';
import ResponseView from './components/ResponseView';
import Sidebar from './components/Sidebar';
import { apiService } from './services/api';

// AppContent ko AuthProvider ke ANDAR rakho
function AppContent() {
  const [response, setResponse] = useState(null);
  const [requestData, setRequestData] = useState({
    url: 'https://jsonplaceholder.typicode.com/posts',
    method: 'GET',
    headers: '{"Content-Type": "application/json"}',
    body: ''
  });
  const { user } = useAuth();

  const handleSaveToHistory = async (request, responseData) => {
    console.log('🟢 handleSaveToHistory CALLED', {
      user: user?.email,
      url: request.url,
      method: request.method,
      responseStatus: responseData?.status
    });
    
    if (!user) {
      console.log('❌ User not logged in, skipping history save');
      return;
    }

    try {
      console.log('🟡 Preparing to save history for:', request.url);
      
      // Ensure body is properly formatted
      let requestBody = request.body;
      
      // Agar body object hai to string mein convert karo
      if (typeof requestBody === 'object') {
        requestBody = JSON.stringify(requestBody);
      }
      
      // Agar body string hai but empty to null set karo
      if (requestBody === '') {
        requestBody = null;
      }

      const historyData = {
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: requestBody,
        response_status: responseData?.status,
        response_data: responseData?.data
      };
      
      console.log('🟡 History data:', historyData);
      
      const result = await apiService.saveToHistory(historyData);
      console.log('✅ History saved successfully for:', request.url);
      
    } catch (error) {
      console.error('❌ Error saving to history:', error);
    }
  };

  const handleRequestSelect = (request) => {
    console.log('🟡 Request selected from sidebar:', request.url);
    setRequestData(request);
  };

  // UPDATED: Ab formData bhi receive karo
  const handleResponse = (responseData, formData) => {
    console.log('🔴 handleResponse CALLED for URL:', formData.url);
    console.log('🔴 Response status:', responseData?.status);
    console.log('🔴 Response data:', responseData?.data ? 'Has data' : 'No data');
    
    setResponse(responseData);
    
    // Request data update karo current formData se
    const currentRequestData = {
      url: formData.url,
      method: formData.method,
      headers: formData.headers,
      body: formData.body
    };
    
    // Update the requestData state for future use
    setRequestData(currentRequestData);
    
    if (user) {
      console.log('🟡 User logged in, calling handleSaveToHistory');
      handleSaveToHistory(currentRequestData, responseData);
    } else {
      console.log('❌ User not logged in, skipping history');
    }
  };

  return (
    <Layout
      header={true}
      sidebar={
        <Sidebar 
          onRequestSelect={handleRequestSelect}
        />
      }
    >
      <div className="h-full flex flex-col">
        {/* Request Section */}
        <div className="flex-1 p-6 pb-3">
          <RequestForm 
            onResponse={handleResponse} 
            initialData={requestData}
          />
        </div>
        
        {/* Response Section */}
        <div className="flex-1 p-6 pt-3">
          <ResponseView response={response} />
        </div>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <CollectionsProvider>
        <AppContent />
      </CollectionsProvider>
    </AuthProvider>
  );
}

export default App;