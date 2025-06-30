import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  FileText,
  Calendar,
  Tag,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { Entry } from '../types';

const EntriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch entries
  const { data: entriesData, isLoading, refetch } = useQuery({
    queryKey: ['entries', currentPage, selectedSource, selectedTags],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      
      if (selectedSource !== 'all') {
        params.append('source', selectedSource);
      }
      
      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      const response = await api.get(`/entries?${params}`);
      return response.data;
    },
  });

  const entries = entriesData?.entries || [];
  const pagination = entriesData?.pagination;

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'chatgpt':
        return '🤖';
      case 'claude':
        return '🧠';
      case 'manual':
        return '✍️';
      case 'api':
        return '🔌';
      default:
        return '📄';
    }
  };

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'chatgpt':
        return 'bg-green-100 text-green-800';
      case 'claude':
        return 'bg-purple-100 text-purple-800';
      case 'manual':
        return 'bg-blue-100 text-blue-800';
      case 'api':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Your Entries
          </h1>
          <p className="text-gray-600">
            Manage your conversational data and knowledge base entries
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Entry</span>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Source Filter */}
            <div className="lg:w-48">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Sources</option>
                <option value="chatgpt">ChatGPT</option>
                <option value="claude">Claude</option>
                <option value="manual">Manual</option>
                <option value="api">API</option>
              </select>
            </div>

            {/* Filter Button */}
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Entries List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : entries.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {entries.map((entry: Entry, index: number) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">
                        {getSourceIcon(entry.source.type)}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-primary-600 transition-colors cursor-pointer">
                          {entry.metadata.title || 'Untitled Entry'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(entry.source.type)}`}>
                            {entry.source.type.toUpperCase()}
                          </span>
                          {entry.embeddings && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              AI Ready
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {entry.content.processed || entry.content.raw}
                    </p>

                    {/* Tags */}
                    {entry.metadata.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mb-3">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {entry.metadata.tags.slice(0, 5).map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={() => {
                                if (!selectedTags.includes(tag)) {
                                  setSelectedTags([...selectedTags, tag]);
                                }
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {entry.metadata.tags.length > 5 && (
                            <span className="text-xs text-gray-500">
                              +{entry.metadata.tags.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {entry.searchStats && (
                        <>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{entry.searchStats.viewCount} views</span>
                          </div>
                          {entry.content.tokenCount && (
                            <div className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>{entry.content.tokenCount} tokens</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-600">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No entries found
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your knowledge base by adding your first entry.
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Entry</span>
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center space-x-2"
        >
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </motion.div>
      )}

      {/* Create Entry Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Add New Entry</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </Button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Entry creation form will be implemented here</p>
              <Button onClick={() => setShowCreateModal(false)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EntriesPage;