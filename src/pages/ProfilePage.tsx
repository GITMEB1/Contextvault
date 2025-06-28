import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Download, 
  Trash2,
  Key,
  Settings,
  Save
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ProfileFormData {
  username: string;
  email: string;
  dataRetentionDays: number;
  marketingConsent: boolean;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>();

  // Fetch user profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data.user;
    },
    onSuccess: (data) => {
      reset({
        username: data.username,
        email: data.email,
        dataRetentionDays: data.privacy?.dataRetentionDays || 365,
        marketingConsent: data.privacy?.marketingConsent || false,
      });
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await api.put('/users/profile', {
        username: data.username,
        privacy: {
          dataRetentionDays: parseInt(data.dataRetentionDays.toString()),
          marketingConsent: data.marketingConsent,
        },
      });
      
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error.message);
    }
  };

  const handleExportData = async () => {
    try {
      toast.success('Data export will be available soon!');
    } catch (error) {
      toast.error('Export failed. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        toast.success('Account deletion will be available soon!');
      } catch (error) {
        toast.error('Account deletion failed. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account settings, privacy preferences, and data.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center space-x-2 mb-6">
                <User className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Username"
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
                    error={errors.username?.message}
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    disabled
                    {...register('email')}
                    helperText="Email cannot be changed"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    id="marketingConsent"
                    type="checkbox"
                    {...register('marketingConsent')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="marketingConsent" className="text-sm text-gray-700">
                    Receive product updates and marketing communications
                  </label>
                </div>

                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Privacy & Data</h2>
              </div>

              <div className="space-y-6">
                <Input
                  label="Data Retention (days)"
                  type="number"
                  {...register('dataRetentionDays', {
                    required: 'Data retention is required',
                    min: { value: 30, message: 'Minimum 30 days' },
                    max: { value: 3650, message: 'Maximum 3650 days (10 years)' },
                  })}
                  error={errors.dataRetentionDays?.message}
                  helperText="How long to keep your data before automatic deletion"
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export My Data</span>
                  </Button>
                  
                  <Button 
                    variant="danger" 
                    onClick={handleDeleteAccount}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center space-x-2 mb-6">
                <Key className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-800">Security</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Password</h3>
                    <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">API Keys</h3>
                    <p className="text-sm text-gray-600">Manage API access tokens</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Keys
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Entries</span>
                  <span className="font-medium">{user?.stats?.totalEntries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Searches</span>
                  <span className="font-medium">{user?.stats?.totalSearches || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">
                    {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Login</span>
                  <span className="font-medium">
                    {user?.stats?.lastActivity ? new Date(user.stats.lastActivity).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email notifications</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Search alerts</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Weekly digest</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Help & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Help & Support</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Contact Support
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Feature Requests
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  Privacy Policy
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;