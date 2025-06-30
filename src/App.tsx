import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import EntriesPage from './pages/EntriesPage';
import ProfilePage from './pages/ProfilePage';
import api from './services/api';

function App() {
  const { user, setAuth, clearAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('🔄 Initializing ContextVault...');
        
        // Test API connection first
        try {
          const healthResponse = await api.get('/health');
          console.log('✅ Backend API is responding:', healthResponse.data);
        } catch (healthError) {
          console.warn('⚠️ Backend health check failed:', healthError);
          // Continue anyway - might be a different endpoint structure
        }

        const token = localStorage.getItem('token');
        if (token) {
          console.log('🔑 Found stored token, verifying...');
          
          // Set the token in the API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            // Try to verify the token
            const response = await api.get('/auth/verify');
            if (response.data.valid) {
              console.log('✅ Token verified, user authenticated');
              setAuth(response.data.user, token);
            } else {
              console.log('❌ Token invalid, clearing auth');
              clearAuth();
            }
          } catch (authError) {
            console.log('❌ Auth verification failed, clearing auth:', authError);
            clearAuth();
          }
        } else {
          console.log('ℹ️ No stored token found');
        }
      } catch (error) {
        console.error('💥 App initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      } finally {
        setIsInitializing(false);
        console.log('✅ App initialization complete');
      }
    };

    verifyAuth();
  }, [setAuth, clearAuth]);

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">ContextVault</h1>
          <p className="text-blue-200">Initializing your intelligent knowledge vault...</p>
        </div>
      </div>
    );
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Initialization Error</h1>
          <p className="text-gray-600 mb-4">{initError}</p>
          <div className="space-y-2 text-sm text-gray-500 mb-4">
            <p>• Make sure the backend is running on localhost:8000</p>
            <p>• Check your internet connection</p>
            <p>• Try refreshing the page</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        {user ? (
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="entries" element={<EntriesPage />} />
            <Route path="analytics" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800">Analytics Coming Soon</h1>
                <p className="text-gray-600 mt-2">Advanced analytics and insights will be available here.</p>
              </div>
            } />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </div>
  );
}

export default App;