export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  stats?: {
    totalEntries: number;
    totalSearches: number;
    lastActivity: string;
  };
  privacy?: {
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    dataRetentionDays: number;
  };
}

export interface Entry {
  id: string;
  userId: string;
  content: {
    raw: string;
    processed?: string;
    tokenCount?: number;
  };
  source: {
    type: 'chatgpt' | 'claude' | 'manual' | 'api';
    version?: string;
    exportDate?: string;
  };
  metadata: {
    title?: string;
    tags: string[];
    timestamp: string;
    customFields?: Record<string, any>;
  };
  embeddings?: {
    model: string;
    dimension: number;
    generatedAt: string;
  };
  privacy?: {
    containsPii: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    retentionDate?: string;
  };
  searchStats?: {
    viewCount: number;
    lastViewed?: string;
    searchHits: number;
    relevanceScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  id: string;
  similarity?: number;
  textScore?: number;
  combinedScore?: number;
  title: string;
  preview: string;
  tags: string[];
  source: {
    type: string;
    version?: string;
  };
  createdAt: string;
  content?: {
    raw: string;
    processed?: string;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  count: number;
  searchType: 'text' | 'vector' | 'hybrid';
  responseTime: string;
  totalEntries?: number;
  threshold?: number;
  weights?: {
    textWeight: number;
    vectorWeight: number;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}