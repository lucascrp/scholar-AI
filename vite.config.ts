import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/scholar-AI/',
  server: {
    port: 3000,
    host: true
  },
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm']
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist']
        }
      }
    }
  },
  worker: {
    format: 'es'
  }
});
