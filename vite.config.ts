import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    https: false, // Explicitly set to false to ensure HTTP protocol
  },
  css: {
    postcss: './postcss.config.js',
  },
});