import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Brain,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  badge?: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon: Icon,
  label,
  isCollapsed,
  badge,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center p-3 rounded-lg transition-all duration-200 group relative',
        isActive
          ? 'bg-primary-700 text-white shadow-md'
          : 'text-gray-300 hover:bg-primary-800 hover:text-white',
        isCollapsed ? 'justify-center' : '',
      )}
    >
      <Icon className={cn('w-5 h-5', !isCollapsed && 'mr-3')} />
      {!isCollapsed && (
        <span className="whitespace-nowrap flex-1">{label}</span>
      )}
      {badge && !isCollapsed && (
        <span className="ml-2 px-2 py-1 text-xs bg-primary-500 text-white rounded-full">
          {badge}
        </span>
      )}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { clearAuth, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      clearAuth();
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout failed:', error);
      clearAuth(); // Clear auth even if API call fails
      toast.success('Logged out successfully!');
    }
  };

  return (
    <aside
      className={cn(
        'bg-primary-900 text-white flex flex-col transition-all duration-300 ease-in-out shadow-xl',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'p-4 flex items-center border-b border-primary-800',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center">
            <Brain className="w-8 h-8 text-primary-300 mr-2" />
            <h1 className="text-xl font-bold whitespace-nowrap">ContextVault</h1>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <SidebarLink 
          to="/dashboard" 
          icon={Home} 
          label="Dashboard" 
          isCollapsed={isCollapsed} 
        />
        <SidebarLink 
          to="/search" 
          icon={Search} 
          label="AI Search" 
          isCollapsed={isCollapsed}
          badge="AI"
        />
        <SidebarLink 
          to="/entries" 
          icon={FileText} 
          label="Entries" 
          isCollapsed={isCollapsed} 
        />
        <SidebarLink 
          to="/analytics" 
          icon={BarChart3} 
          label="Analytics" 
          isCollapsed={isCollapsed} 
        />
        <SidebarLink 
          to="/profile" 
          icon={User} 
          label="Profile" 
          isCollapsed={isCollapsed} 
        />
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-primary-800">
        {!isCollapsed && user && (
          <div className="mb-3 p-3 bg-primary-800 rounded-lg">
            <p className="text-sm font-medium text-white truncate">{user.username}</p>
            <p className="text-xs text-primary-300 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-primary-800 hover:text-white transition-colors duration-200',
            isCollapsed ? 'justify-center' : '',
          )}
        >
          <LogOut className={cn('w-5 h-5', !isCollapsed && 'mr-3')} />
          {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;