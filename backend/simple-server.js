const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8000;

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

// Mock data
const mockEntries = [
  {
    id: '1',
    title: 'Welcome to ContextVault',
    content: 'This is a sample entry to demonstrate the application.',
    category: 'general',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Getting Started',
    content: 'Learn how to use ContextVault for managing your conversational data.',
    category: 'tutorial',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Set content type to JSON
  res.setHeader('Content-Type', 'application/json');

  // Routes
  if (pathname === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'ContextVault API (Minimal)',
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        health: '/v1/health',
        entries: '/v1/entries'
      }
    }));
  } else if (pathname === '/v1/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'development',
      message: 'Minimal server running without external dependencies'
    }));
  } else if (pathname === '/v1/entries') {
    if (method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: mockEntries,
        total: mockEntries.length
      }));
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const newEntry = JSON.parse(body);
          const entry = {
            id: String(mockEntries.length + 1),
            ...newEntry,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          mockEntries.push(entry);
          res.writeHead(201);
          res.end(JSON.stringify({
            success: true,
            data: entry
          }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid JSON'
          }));
        }
      });
    } else {
      res.writeHead(405);
      res.end(JSON.stringify({
        error: 'Method not allowed'
      }));
    }
  } else if (pathname.startsWith('/v1/auth/')) {
    // Mock auth endpoints
    if (pathname === '/v1/auth/login' && method === 'POST') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User'
        }
      }));
    } else if (pathname === '/v1/auth/register' && method === 'POST') {
      res.writeHead(201);
      res.end(JSON.stringify({
        success: true,
        message: 'User registered successfully',
        user: {
          id: '2',
          email: 'new@example.com',
          name: 'New User'
        }
      }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({
        error: 'Auth endpoint not found'
      }));
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({
      error: 'Endpoint not found',
      path: pathname,
      method: method
    }));
  }
});

server.listen(PORT, () => {
  console.log(`ContextVault Minimal API running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/v1/health`);
  console.log(`Entries: http://localhost:${PORT}/v1/entries`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}); 