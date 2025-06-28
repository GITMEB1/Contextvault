import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Brain, 
  TrendingUp, 
  Clock, 
  Plus,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Total Entries',
      value: '1,247',
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Searches Today',
      value: '89',
      change: '+23%',
      icon: Search,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'AI Embeddings',
      value: '98%',
      change: '+5%',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Avg. Relevance',
      value: '94%',
      change: '+2%',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const quickActions = [
    {
      title: 'Add New Entry',
      description: 'Create a new conversational entry',
      icon: Plus,
      action: () => navigate('/entries'),
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      title: 'AI Search',
      description: 'Search with semantic understanding',
      icon: Brain,
      action: () => navigate('/search'),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      title: 'View All Entries',
      description: 'Browse your knowledge base',
      icon: FileText,
      action: () => navigate('/entries'),
      color: 'bg-green-600 hover:bg-green-700',
    },
  ];

  const recentActivity = [
    {
      type: 'search',
      description: 'Searched for "machine learning ethics"',
      time: '2 hours ago',
      icon: Search,
    },
    {
      type: 'entry',
      description: 'Added new entry from ChatGPT export',
      time: 'Yesterday',
      icon: Plus,
    },
    {
      type: 'view',
      description: 'Viewed entry "Neural Networks Explained"',
      time: '2 days ago',
      icon: FileText,
    },
    {
      type: 'embedding',
      description: 'Generated embeddings for 15 new entries',
      time: '3 days ago',
      icon: Brain,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your intelligent knowledge vault today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">vs last week</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card 
              key={action.title} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
              onClick={action.action}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg text-white ${action.color} transition-colors`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity & AI Insights */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <activity.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.description}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-800">AI Insights</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-gray-800 mb-2">Trending Topics</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Your most searched topics this week: AI Ethics, Machine Learning, Neural Networks
                </p>
                <div className="flex flex-wrap gap-2">
                  {['AI Ethics', 'Machine Learning', 'Neural Networks'].map((topic) => (
                    <span 
                      key={topic}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-gray-800 mb-2">Search Performance</h3>
                <p className="text-sm text-gray-600">
                  Your AI-powered searches are 94% more accurate than keyword searches
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h3 className="font-medium text-gray-800 mb-2">Content Suggestion</h3>
                <p className="text-sm text-gray-600">
                  Consider adding more content about "Deep Learning" - it's related to your interests
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;