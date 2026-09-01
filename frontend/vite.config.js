import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0)
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Required for Docker bind mounts on Windows
      interval: 100
    },
    proxy: {
      '/api': {
        target: 'http://backend:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
