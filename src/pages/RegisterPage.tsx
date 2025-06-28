import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, User } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
}

const RegisterPage: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
        privacy: {
          dataProcessingConsent: data.dataProcessingConsent,
          marketingConsent: data.marketingConsent,
        },
      });
      setAuth(response.data.user, response.data.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error.message);
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Start building your intelligent knowledge vault</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Choose a username"
              className="pl-10"
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
              error={errors.username?.message}
            />
          </div>

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
              placeholder="Create a password"
              className="pl-10"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              error={errors.password?.message}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="password"
              placeholder="Confirm your password"
              className="pl-10"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                id="dataProcessingConsent"
                type="checkbox"
                {...register('dataProcessingConsent', {
                  required: 'You must consent to data processing',
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="dataProcessingConsent" className="ml-3 block text-sm text-gray-700">
                I agree to the{' '}
                <span className="text-primary-600 hover:text-primary-700 cursor-pointer">
                  data processing and privacy policy
                </span>
                <span className="text-error-500 ml-1">*</span>
              </label>
            </div>
            {errors.dataProcessingConsent && (
              <p className="text-sm text-error-600 ml-7">
                {errors.dataProcessingConsent.message}
              </p>
            )}

            <div className="flex items-start">
              <input
                id="marketingConsent"
                type="checkbox"
                {...register('marketingConsent')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="marketingConsent" className="ml-3 block text-sm text-gray-700">
                I would like to receive product updates and marketing communications (optional)
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            isLoading={isSubmitting}
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;