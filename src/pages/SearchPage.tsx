import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Brain, 
  Zap, 
  Filter, 
  SlidersHorizontal,
  Sparkles,
  Clock,
  Tag,
  FileText,
  ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { SearchResult, SearchResponse } from '../types';

type SearchMode = 'text' | 'vector' | 'hybrid';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('vector');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [textWeight, setTextWeight] = useState(0.3);
  const [vectorWeight, setVectorWeight] = useState(0.7);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchInfo, setSearchInfo] = useState<Partial<SearchResponse> | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Get search suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions'],
    queryFn: async () => {
      const response = await api.get('/search/suggestions');
      return response.data;
    },
    enabled: !query,
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      let response;
      
      switch (searchMode) {
        case 'text':
          response = await api.get(`/search/text?q=${encodeURIComponent(query)}&limit=20`);
          break;
        case 'vector':
          response = await api.post('/search/vector', {
            query,
            limit: 20,
            threshold: 0.7,
            includeContent: false
          });
          break;
        case 'hybrid':
          response = await api.post('/search/hybrid', {
            query,
            textWeight,
            vectorWeight,
            limit: 20
          });
          break;
      }
      
      setResults(response.data.results || []);
      setSearchInfo(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setSearchInfo(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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

  const getSearchModeInfo = (mode: SearchMode) => {
    switch (mode) {
      case 'text':
        return {
          title: 'Text Search',
          description: 'Traditional keyword matching',
          icon: Search,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'vector':
        return {
          title: 'AI Search',
          description: 'Semantic understanding',
          icon: Brain,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        };
      case 'hybrid':
        return {
          title: 'Hybrid Search',
          description: 'Best of both worlds',
          icon: Zap,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          AI-Powered Search
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Search your knowledge base with advanced AI that understands meaning, context, and intent.
        </p>
      </motion.div>

      {/* Search Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-6 h-6 text-gray-400" />
              <Input
                type="text"
                placeholder="Search your knowledge base... (e.g., 'machine learning ethics')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-lg py-3"
              />
              <Button 
                onClick={handleSearch} 
                isLoading={isSearching}
                className="px-8"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Search Mode Toggles */}
          <div className="flex flex-wrap gap-3 mb-6">
            {(['text', 'vector', 'hybrid'] as SearchMode[]).map((mode) => {
              const info = getSearchModeInfo(mode);
              return (
                <button
                  key={mode}
                  onClick={() => setSearchMode(mode)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                    searchMode === mode
                      ? `${info.bgColor} border-current ${info.color}`
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <info.icon className="w-4 h-4" />
                  <span className="font-medium">{info.title}</span>
                  {mode === 'vector' && <Sparkles className="w-3 h-3" />}
                </button>
              );
            })}
          </div>

          {/* Advanced Options */}
          {searchMode === 'hybrid' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">Search Weights</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Weight: {Math.round(textWeight * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={textWeight}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setTextWeight(value);
                      setVectorWeight(1 - value);
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Weight: {Math.round(vectorWeight * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={vectorWeight}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setVectorWeight(value);
                      setTextWeight(1 - value);
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Search Mode Description */}
          <div className="text-center text-sm text-gray-600">
            {searchMode === 'text' && 'Traditional keyword-based search using full-text indexing'}
            {searchMode === 'vector' && 'AI-powered semantic search that understands meaning and context'}
            {searchMode === 'hybrid' && 'Combines keyword matching with AI understanding for optimal results'}
          </div>
        </Card>
      </motion.div>

      {/* Search Results */}
      {isSearching && (
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {searchInfo && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Search Results
              </h2>
              <p className="text-gray-600">
                Found {searchInfo.count} results in {searchInfo.responseTime} 
                {searchInfo.searchType && ` using ${searchInfo.searchType} search`}
              </p>
            </div>
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">
                          {getSourceIcon(result.source.type)}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-primary-600 transition-colors">
                          {result.title || 'Untitled Entry'}
                        </h3>
                        {result.similarity && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            {Math.round(result.similarity * 100)}% match
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-3">
                        {result.preview}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span className="capitalize">{result.source.type}</span>
                        </div>
                        {result.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Tag className="w-4 h-4" />
                            <div className="flex space-x-1">
                              {result.tags.slice(0, 3).map((tag) => (
                                <span 
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {result.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{result.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm" className="text-primary-600">
                        Find Similar
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Suggestions */}
      {!query && suggestions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Search Suggestions
            </h3>
            
            {suggestions.suggestions?.popularTags && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.suggestions.popularTags.slice(0, 10).map((tag: any) => (
                    <button
                      key={tag.tag}
                      onClick={() => setQuery(tag.tag)}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm hover:bg-primary-200 transition-colors"
                    >
                      {tag.tag} ({tag.count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestions.embeddingStatus && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">AI Search Status</h4>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  {suggestions.embeddingStatus.withEmbeddings} of {suggestions.embeddingStatus.totalEntries} entries 
                  have AI embeddings for semantic search
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(suggestions.embeddingStatus.withEmbeddings / suggestions.embeddingStatus.totalEntries) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!isSearching && query && results.length === 0 && searchInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or switching to a different search mode.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setSearchMode('hybrid')}
              >
                Try Hybrid Search
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setQuery('')}
              >
                Clear Search
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default SearchPage;