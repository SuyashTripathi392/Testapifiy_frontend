import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Signup from './Signup';

const Layout = ({ children, sidebar, header }) => {
  const [authModal, setAuthModal] = useState(null); // 'login', 'signup', or null
  const { user, signOut } = useAuth();

  const handleAuthSuccess = () => {
    setAuthModal(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-inter">
      {/* Auth Modals */}
      {authModal === 'login' && (
        <Login 
          onClose={() => setAuthModal(null)} 
          switchToSignup={() => setAuthModal('signup')}
        />
      )}
      
      {authModal === 'signup' && (
        <Signup 
          onClose={() => setAuthModal(null)} 
          switchToLogin={() => setAuthModal('login')}
        />
      )}

      {/* Header */}
      {header && (
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">API</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Testapify</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <span className="text-sm text-gray-700">
                      Welcome, {user.user_metadata?.name || user.email}
                    </span>
                    <button 
                      onClick={signOut}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setAuthModal('login')}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setAuthModal('signup')}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-80 bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
            {sidebar}
          </aside>
        )}

        {/* Main Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;