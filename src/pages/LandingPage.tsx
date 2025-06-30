import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Search, 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Semantic Search',
      description: 'Find content by meaning, not just keywords. Our AI understands context and intent.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Search through thousands of conversations in milliseconds with optimized vector search.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data stays secure with enterprise-grade encryption and privacy controls.',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Gain insights into your conversations with intelligent analytics and trends.',
    },
  ];

  const benefits = [
    'Store unlimited conversations and documents',
    'AI-powered semantic search and discovery',
    'Advanced filtering and organization',
    'Privacy-compliant data management',
    'Real-time search suggestions',
    'Export and backup capabilities',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">ContextVault</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-white hover:text-primary-200 transition-colors"
            >
              Login
            </Link>
            <Button variant="outline" className="bg-white text-primary-800 hover:bg-gray-100">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
                Your Intelligent
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                  Knowledge Vault
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Store, organize, and discover your conversational data with AI-powered semantic search. 
                Transform your ChatGPT conversations, documents, and notes into an intelligent knowledge base.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
            >
              <Button size="lg" className="bg-white text-primary-800 hover:bg-gray-100">
                <Link to="/register" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary-800"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </motion.div>

            {/* Demo Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Search className="w-6 h-6 text-white" />
                  <span className="text-white font-medium">Try AI Search:</span>
                </div>
                <div className="bg-white rounded-lg p-4 text-left">
                  <div className="text-gray-600 text-sm mb-2">Search your knowledge base...</div>
                  <div className="text-primary-800 font-medium">
                    "Find conversations about machine learning ethics"
                  </div>
                </div>
                <div className="flex items-center justify-center mt-4 space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-blue-100">AI understands meaning, not just keywords</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Powerful Features for Smart Knowledge Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ContextVault combines cutting-edge AI with intuitive design to revolutionize 
              how you store, search, and discover your conversational data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Everything you need to manage your knowledge
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                From simple storage to advanced AI-powered discovery, ContextVault provides 
                all the tools you need to turn your conversations into actionable insights.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-success-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-primary-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-8 bg-primary-100 rounded-lg flex items-center px-4">
                      <Search className="w-4 h-4 text-primary-600 mr-2" />
                      <span className="text-sm text-primary-800">AI Search Results</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-800">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to unlock your knowledge potential?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have transformed their conversational data 
            into intelligent, searchable knowledge bases.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-primary-800 hover:bg-gray-100">
              <Link to="/register" className="flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary-800"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="w-6 h-6" />
            <span className="text-lg font-semibold">ContextVault</span>
          </div>
          <p className="text-blue-200">
            &copy; {new Date().getFullYear()} ContextVault. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;