import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post('/auth/login', data);
      setAuth(response.data.user, response.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-800">ContextVault</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back</h2>
          <p className="text-gray-600">Sign in to your intelligent knowledge vault</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="password"
              placeholder="Enter your password"
              className="pl-10"
              {...register('password', {
                required: 'Password is required',
              })}
              error={errors.password?.message}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>Demo:</strong> Use any email and password to explore the app
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;