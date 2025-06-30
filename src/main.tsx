import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('React Error Boundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Reload Page
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">Technical Details</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Check if root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1 style="color: red;">Error: Root element not found</h1>
      <p>The HTML file is missing the required &lt;div id="root"&gt;&lt;/div&gt; element.</p>
    </div>
  `;
  throw new Error('Root element with id="root" not found in the DOM');
}

// Add loading indicator while React loads
rootElement.innerHTML = `
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb;">
    <div style="text-align: center;">
      <div style="width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
      <p style="color: #6b7280; font-family: Arial, sans-serif;">Loading ContextVault...</p>
    </div>
  </div>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`;

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster 
              position="top-right" 
              reverseOrder={false}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Failed to render React app:', error);
  rootElement.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; padding: 20px;">
      <div style="text-align: center; max-width: 500px;">
        <h1 style="color: #dc2626; margin-bottom: 16px; font-family: Arial, sans-serif;">Failed to Load Application</h1>
        <p style="color: #6b7280; margin-bottom: 16px; font-family: Arial, sans-serif;">
          Error: ${error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-family: Arial, sans-serif;">
          Reload Page
        </button>
      </div>
    </div>
  `;
}