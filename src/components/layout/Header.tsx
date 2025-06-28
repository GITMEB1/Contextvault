import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Bell, Settings, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome back, {user?.username || 'Guest'}!
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Quick Search Button */}
          <button
            onClick={() => navigate('/search')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            title="Quick Search"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-error-500 rounded-full"></span>
          </button>
          
          {/* Settings */}
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;