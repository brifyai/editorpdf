import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // Desactivar Service Worker durante desarrollo
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  define: {
    // Desactivar Service Worker en desarrollo
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
    'process.env.NODE_ENV': JSON.stringify('development')
  },
  optimizeDeps: {
    // Forzar la reconstrucción de dependencias
    force: true
  }
});
