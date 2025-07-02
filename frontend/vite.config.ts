import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Now we can afford detailed source maps
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge'],
          charts: ['recharts'], // Separate chunk for charts
          forms: ['react-hook-form', '@tanstack/react-query'],
          utils: ['axios', 'zustand', 'react-hot-toast']
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser', // More thorough minification
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: false
      }
    }
  },
  define: {
    'process.env': {},
  },
}); 