import React, { useState, useEffect } from 'react';
import { useCollections } from '../context/CollectionsContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import CreateCollectionModal from './CreateCollectionModal';
import AddRequestModal from './AddRequestModal'; // New import

const Sidebar = ({ onRequestSelect }) => {
  const { 
    collections, 
    activeCollection, 
    setActiveCollection,
    createCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    refreshCollections
  } = useCollections();
  
  const { user } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false); // New state
  const [selectedCollectionForRequest, setSelectedCollectionForRequest] = useState(null); // New state
  const [activeSection, setActiveSection] = useState('history');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load history when user logs in
  useEffect(() => {
    if (user) {
      loadHistory();
      refreshCollections();
    } else {
      setHistory([]);
    }
  }, [user, activeSection]);

  const loadHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await apiService.getHistory();
      setHistory(response.data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemClick = (item) => {
    if (onRequestSelect) {
      onRequestSelect({
        url: item.url,
        method: item.method,
        headers: JSON.stringify(item.headers || {}, null, 2),
        body: item.body ? JSON.stringify(item.body, null, 2) : ''
      });
    }
  };

  const handleCollectionItemClick = (item) => {
    if (onRequestSelect) {
      onRequestSelect({
        url: item.url,
        method: item.method,
        headers: JSON.stringify(item.headers || {}, null, 2),
        body: item.body ? JSON.stringify(item.body, null, 2) : ''
      });
    }
  };

  // Function to open Add Request modal
  const openAddRequestModal = (collectionId) => {
    setSelectedCollectionForRequest(collectionId);
    setShowAddRequestModal(true);
  };

  const deleteHistoryItem = async (id) => {
    try {
      await apiService.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await apiService.clearHistory();
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Modals */}
      <CreateCollectionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
      
      <AddRequestModal 
        isOpen={showAddRequestModal}
        onClose={() => setShowAddRequestModal(false)}
        collectionId={selectedCollectionForRequest}
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSection('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'history'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveSection('collections')}
          className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'collections'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Collections
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'history' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Recent Requests</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {history.length}
                </span>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-red-500 hover:text-red-600"
                    title="Clear all history"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading history...</p>
              </div>
            ) : history.map((item) => (
              <div 
                key={item.id}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistoryItem(item.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-start justify-between mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    item.method === 'GET' ? 'bg-green-100 text-green-800' :
                    item.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    item.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.method}
                  </span>
                  {item.response_status && (
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                      item.response_status >= 200 && item.response_status < 300 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.response_status}
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-gray-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
                  {item.url}
                </div>
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            
            {!loading && history.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm">No requests yet</p>
                <p className="text-xs mt-1">Send your first API request</p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'collections' && (
          <div className="p-4 space-y-4">
            {!user ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm font-medium text-gray-600 mb-1">Sign in required</p>
                <p className="text-xs text-gray-500">Please sign in to manage collections</p>
              </div>
            ) : (
              <>
                {/* Collections List */}
                {collections.map((collection) => (
                  <div key={collection.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Collection Header */}
                    <div 
                      className="p-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setActiveCollection(
                        activeCollection?.id === collection.id ? null : collection
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg 
                            className={`w-4 h-4 text-gray-500 transform transition-transform ${
                              activeCollection?.id === collection.id ? 'rotate-90' : ''
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <h4 className="text-sm font-medium text-gray-900">{collection.name}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                            {(collection.items || []).length} requests
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this collection?')) {
                                deleteCollection(collection.id);
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete collection"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {collection.description && (
                        <p className="text-xs text-gray-500 mt-1 ml-6">{collection.description}</p>
                      )}
                    </div>

                    {/* Collection Items */}
                    {activeCollection?.id === collection.id && (
                      <div className="bg-white">
                        {/* Add Request Button */}
                        <div className="p-3 border-b border-gray-100">
                          <button
                            onClick={() => openAddRequestModal(collection.id)}
                            className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add New Request</span>
                          </button>
                        </div>

                        {/* Collection Items List */}
                        {(collection.items || []).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleCollectionItemClick(item)}
                            className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 cursor-pointer transition-colors group relative"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to remove this request from collection?')) {
                                  removeFromCollection(collection.id, item.id);
                                }
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            <div className="flex items-start justify-between mb-1">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                item.method === 'GET' ? 'bg-green-100 text-green-800' :
                                item.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                item.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.method}
                              </span>
                            </div>
                            <div className="text-xs font-medium text-gray-900 truncate mb-1">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {item.url}
                            </div>
                          </div>
                        ))}
                        
                        {(collection.items || []).length === 0 && (
                          <div className="p-4 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm mb-2">No requests in this collection</p>
                            <p className="text-xs text-gray-500 mb-3">Add your first API request manually</p>
                            <button
                              onClick={() => openAddRequestModal(collection.id)}
                              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                            >
                              Add First Request
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty Collections State */}
                {collections.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-600 mb-1">No collections yet</p>
                    <p className="text-xs text-gray-500 mb-4">Create your first collection to organize API requests</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="text-xs bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Create Collection
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer with New Collection Button */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => setShowModal(true)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Collection</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;