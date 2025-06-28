File Contents for Manual Creation:
postcss.config.js

Click to expand

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
tsconfig.json

Click to expand

{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
tsconfig.node.json

Click to expand

{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "target": "ES2020",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
vite.config.ts

Click to expand

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
index.html

Click to expand

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ContextVault</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
src/main.tsx

Click to expand

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
src/index.css

Click to expand

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans bg-gray-50 text-gray-800;
  }
}
src/App.tsx

Click to expand

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
import { useEffect } from 'react';
import { api } from './services/api';

function App() {
  const { user, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/verify');
          if (response.data.valid) {
            setAuth(response.data.user, token);
          } else {
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        clearAuth();
      }
    };
    verifyAuth();
  }, [setAuth, clearAuth]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {user ? (
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="entries" element={<EntriesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default App;
src/store/authStore.ts

Click to expand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('token', token);
      },
      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // use localStorage
    },
  ),
);
src/services/api.ts

Click to expand

import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { clearAuth } = useAuthStore.getState(); // Get state from outside React component

    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = data.error?.message || 'An unexpected error occurred.';
      const errorCode = data.error?.code;

      switch (status) {
        case 400:
          errorMessage = errorMessage || 'Bad Request.';
          break;
        case 401:
          errorMessage = errorMessage || 'Unauthorized. Please log in again.';
          clearAuth(); // Clear auth state on 401
          window.location.href = '/login'; // Redirect to login page
          break;
        case 403:
          errorMessage = errorMessage || 'Forbidden. You do not have access.';
          break;
        case 404:
          errorMessage = errorMessage || 'Resource not found.';
          break;
        case 409:
          errorMessage = errorMessage || 'Conflict. The resource already exists.';
          break;
        case 429:
          errorMessage = errorMessage || 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = errorMessage || 'Server error. Please try again later.';
          break;
        default:
          errorMessage = errorMessage || `Error: ${status}`;
      }
      toast.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('No response from server. Please check your internet connection.');
      return Promise.reject(new Error('No response from server.'));
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('Request setup error. Please try again.');
      return Promise.reject(new Error('Request setup error.'));
    }
  },
);
src/components/ui/LoadingSpinner.tsx

Click to expand

import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const sizeClasses = {
  small: 'w-4 h-4 border-2',
  medium: 'w-8 h-8 border-4',
  large: 'w-12 h-12 border-4',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'border-primary-500',
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-block rounded-full animate-spin',
        sizeClasses[size],
        color,
        'border-t-transparent',
        className,
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
src/components/ui/Button.tsx

Click to expand

import React from 'react';
import { cn } from '../../utils/cn';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-5 py-2.5 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        {
          'opacity-70 cursor-not-allowed': disabled || isLoading,
        },
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner size="small" color="border-white" className="mr-2" />}
      {children}
    </button>
  );
};

export default Button;
src/components/ui/Input.tsx

Click to expand

import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
          {
            'border-red-500 focus:ring-red-500 focus:border-red-500': error,
          },
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
src/utils/cn.ts

Click to expand

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
src/pages/LandingPage.tsx

Click to expand

import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900 text-white p-4">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 animate-fade-in">
          ContextVault
        </h1>
        <p className="text-xl md:text-2xl font-light opacity-90 animate-fade-in animation-delay-200">
          Your Intelligent Conversational Data Management System
        </p>
      </header>

      <section className="text-center max-w-3xl mb-12">
        <p className="text-lg md:text-xl mb-6 animate-fade-in animation-delay-400">
          Unlock the power of your conversations with AI-driven semantic search.
          ContextVault helps you store, organize, and retrieve insights from your
          chat exports, documents, and notes like never before.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
          <Button as={Link} to="/register" size="large" variant="primary">
            Get Started Free
          </Button>
          <Button as={Link} to="/login" size="large" variant="outline" className="text-white border-white hover:bg-white hover:text-primary-700">
            Login
          </Button>
        </div>
      </section>

      <footer className="text-center text-sm opacity-70 mt-auto">
        &copy; {new Date().getFullYear()} ContextVault. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
src/pages/LoginPage.tsx

Click to expand

import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const onSubmit = async (data: any) => {
    try {
      const response = await api.post('/auth/login', data);
      setAuth(response.data.user, response.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      // Error handled by interceptor, just log or show generic message if needed
      console.error('Login error:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login to ContextVault</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="your@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message?.toString()}
          />
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
            })}
            error={errors.password?.message?.toString()}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Login
          </Button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
src/pages/RegisterPage.tsx

Click to expand

import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const onSubmit = async (data: any) => {
    try {
      const response = await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
        privacy: {
          dataProcessingConsent: data.dataProcessingConsent,
          marketingConsent: data.marketingConsent || false,
        },
      });
      setAuth(response.data.user, response.data.token);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Your ContextVault Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Username"
            id="username"
            type="text"
            placeholder="john_doe"
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters',
              },
              maxLength: {
                value: 30,
                message: 'Username cannot exceed 30 characters',
              },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores',
              },
            })}
            error={errors.username?.message?.toString()}
          />
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="your@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message?.toString()}
          />
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
            error={errors.password?.message?.toString()}
          />
          <div className="flex items-center">
            <input
              id="dataProcessingConsent"
              type="checkbox"
              {...register('dataProcessingConsent', {
                required: 'You must consent to data processing',
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="dataProcessingConsent" className="ml-2 block text-sm text-gray-900">
              I agree to data processing and privacy policy
            </label>
          </div>
          {errors.dataProcessingConsent && (
            <p className="mt-1 text-sm text-red-600">
              {errors.dataProcessingConsent.message?.toString()}
            </p>
          )}
          <div className="flex items-center">
            <input
              id="marketingConsent"
              type="checkbox"
              {...register('marketingConsent')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-900">
              I agree to receive marketing communications (optional)
            </label>
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Register
          </Button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
src/components/layout/Layout.tsx

Click to expand

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Outlet /> {/* This is where child routes will be rendered */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
src/components/layout/Sidebar.tsx

Click to expand

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  FileText,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon: Icon,
  label,
  isCollapsed,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center p-3 rounded-lg transition-colors duration-200',
        isActive
          ? 'bg-primary-700 text-white shadow-md'
          : 'text-gray-300 hover:bg-primary-800 hover:text-white',
        isCollapsed ? 'justify-center' : '',
      )}
    >
      <Icon className={cn('w-5 h-5', !isCollapsed && 'mr-3')} />
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      clearAuth();
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <aside
      className={cn(
        'bg-primary-900 text-white flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20 items-center' : 'w-64',
      )}
    >
      <div
        className={cn(
          'p-4 flex items-center',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!isCollapsed && (
          <h1 className="text-2xl font-bold whitespace-nowrap">ContextVault</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <SidebarLink to="/dashboard" icon={Home} label="Dashboard" isCollapsed={isCollapsed} />
        <SidebarLink to="/search" icon={Search} label="Search" isCollapsed={isCollapsed} />
        <SidebarLink to="/entries" icon={FileText} label="Entries" isCollapsed={isCollapsed} />
        <SidebarLink to="/profile" icon={User} label="Profile" isCollapsed={isCollapsed} />
      </nav>

      <div className="p-4 border-t border-primary-800">
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
src/components/layout/Header.tsx

Click to expand

import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Bell, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-800">
        Welcome, {user?.username || 'Guest'}!
      </h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
          <Settings className="w-5 h-5" />
        </button>
        {/* User Avatar/Dropdown could go here */}
      </div>
    </header>
  );
};

export default Header;
src/pages/DashboardPage.tsx

Click to expand

import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Stat Card */}
        <div className="bg-primary-100 p-5 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-primary-800 mb-2">Total Entries</h3>
          <p className="text-4xl font-bold text-primary-900">1,234</p>
        </div>
        <div className="bg-secondary-100 p-5 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-secondary-800 mb-2">Total Searches</h3>
          <p className="text-4xl font-bold text-secondary-900">5,678</p>
        </div>
        <div className="bg-accent-100 p-5 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-accent-800 mb-2">AI Embeddings</h3>
          <p className="text-4xl font-bold text-accent-900">98%</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <ul className="space-y-3">
          <li className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
            <p className="text-gray-700">Searched for "machine learning ethics"</p>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </li>
          <li className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
            <p className="text-gray-700">Added new entry from ChatGPT export</p>
            <span className="text-sm text-gray-500">Yesterday</span>
          </li>
          <li className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center justify-between">
            <p className="text-gray-700">Viewed entry "Neural Networks Explained"</p>
            <span className="text-sm text-gray-500">3 days ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
src/pages/SearchPage.tsx

Click to expand

import React from 'react';

const SearchPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Intelligent Search</h2>
      <p className="text-gray-700">
        This page will feature the core search functionality:
      </p>
      <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
        <li>Unified Search Bar (Text, Vector, Hybrid modes)</li>
        <li>Real-time Search Suggestions</li>
        <li>Search Results with relevance scores, previews, and source indicators</li>
        <li>Advanced Filters (source, date range, tags, content type)</li>
        <li>"Find Similar" buttons for each result</li>
      </ul>
      <div className="mt-8 p-4 border border-dashed border-gray-300 rounded-md text-gray-500">
        <p>Search interface and logic to be implemented here.</p>
      </div>
    </div>
  );
};

export default SearchPage;
src/pages/EntriesPage.tsx

Click to expand

import React from 'react';

const EntriesPage: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Entries</h2>
      <p className="text-gray-700">
        This page will display a list of all your conversational entries.
      </p>
      <ul className="list-disc list-inside text-gray-600 mt-4 space-y-2">
        <li>Entry List with pagination, filtering, and sorting</li>
        <li>Entry Creation with rich text editor and auto-tagging</li>
        <li>Entry Detail View with full content and metadata</li>
        <li>Bulk Operations for power users</li>
      </ul>
      <div className="mt-8 p-4 border border-dashed border-gray-300 rounded-md text-gray-500">
        <p>Entry management components and logic to be implemented here.</p>
      </div>
    </div>
  );
};

export default EntriesPage;
src/pages/ProfilePage.tsx

Click to expand

import React from 'react';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useForm } from 'react-hook-form';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      dataRetentionDays: 365, // Placeholder, fetch from user.privacy later
      marketingConsent: false, // Placeholder
    },
  });

  React.useEffect(() => {
    // Fetch user profile data on component mount
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        const fetchedUser = response.data.user;
        reset({
          username: fetchedUser.username,
          email: fetchedUser.email,
          dataRetentionDays: fetchedUser.privacy?.dataRetentionDays || 365,
          marketingConsent: fetchedUser.privacy?.marketingConsent || false,
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data.');
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: any) => {
    try {
      const response = await api.put('/auth/profile', {
        username: data.username,
        privacy: {
          dataRetentionDays: parseInt(data.dataRetentionDays),
          marketingConsent: data.marketingConsent,
        },
      });
      setAuth(response.data.user, localStorage.getItem('token') || ''); // Update store with new user data
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        <Input
          label="Username"
          id="username"
          type="text"
          {...register('username', {
            required: 'Username is required',
            minLength: { value: 3, message: 'Username must be at least 3 characters' },
            maxLength: { value: 30, message: 'Username cannot exceed 30 characters' },
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Username can only contain letters, numbers, and underscores',
            },
          })}
          error={errors.username?.message?.toString()}
        />
        <Input
          label="Email"
          id="email"
          type="email"
          disabled // Email is typically not editable
          {...register('email')}
        />

        <div className="flex items-center">
          <input
            id="marketingConsent"
            type="checkbox"
            {...register('marketingConsent')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-900">
            Receive marketing communications
          </label>
        </div>

        <Input
          label="Data Retention (days)"
          id="dataRetentionDays"
          type="number"
          {...register('dataRetentionDays', {
            required: 'Data retention is required',
            min: { value: 30, message: 'Minimum 30 days' },
            max: { value: 3650, message: 'Maximum 3650 days (10 years)' },
          })}
          error={errors.dataRetentionDays?.message?.toString()}
          className="w-full"
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Update Profile
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
After you have manually created and populated these files, please proceed with the following s