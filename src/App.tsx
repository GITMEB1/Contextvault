import { useEffect, useState } from 'react';
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
  const [protocolMismatch, setProtocolMismatch] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('🔄 Initializing ContextVault...');
        
        // Check for protocol mismatch (HTTPS frontend trying to call HTTP backend)
        const currentProtocol = window.location.protocol;
        const apiBaseURL = api.defaults.baseURL || '';
        
        if (currentProtocol === 'https:' && apiBaseURL.startsWith('http://')) {
          console.warn('⚠️ Protocol mismatch detected: HTTPS frontend trying to call HTTP backend');
          setProtocolMismatch(true);
          setIsInitializing(false);
          return;
        }
        
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

  // Show protocol mismatch error screen
  if (protocolMismatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center max-w-2xl">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-800 mb-4">Mixed Content Security Error</h1>
            <p className="text-lg text-red-700 mb-6">
              Your browser is blocking API requests because you're accessing the app via HTTPS while the backend runs on HTTP.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg mb-6 text-left">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How to fix this:</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                <div>
                  <p className="font-medium text-gray-800">Navigate to HTTP version</p>
                  <p className="text-gray-600 text-sm">Go to <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code> instead</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                <div>
                  <p className="font-medium text-gray-800">Clear HSTS settings (if needed)</p>
                  <p className="text-gray-600 text-sm">If your browser automatically redirects to HTTPS:</p>
                  <ul className="text-gray-600 text-sm mt-1 ml-4 list-disc">
                    <li>Chrome: Go to <code className="bg-gray-100 px-1 rounded">chrome://net-internals/#hsts</code></li>
                    <li>Enter <code className="bg-gray-100 px-1 rounded">localhost</code> in "Delete domain security policies"</li>
                    <li>Click "Delete"</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                <div>
                  <p className="font-medium text-gray-800">Alternative: Use HTTPS for backend</p>
                  <p className="text-gray-600 text-sm">Configure your backend to run on HTTPS (more complex)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <a
              href="http://localhost:3000"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to HTTP Version
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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