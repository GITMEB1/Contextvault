import React, { useEffect } from 'react';
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

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set the token in the API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Try to verify the token
          const response = await api.get('/auth/verify');
          if (response.data.valid) {
            setAuth(response.data.user, token);
          } else {
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        clearAuth();
      }
    };

    verifyAuth();
  }, [setAuth, clearAuth]);

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