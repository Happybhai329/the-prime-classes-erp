import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-dom';
            }
            if (id.includes('react/')) {
              return 'react-core';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'recharts';
            }
            if (id.includes('react-router-dom') || id.includes('@remix-run')) {
              return 'react-router';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
