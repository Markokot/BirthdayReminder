import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: [
      '579aadb9-3a6b-427b-8dec-25d94a10f385-00-23p4j6bn8xs6r.sisko.replit.dev',
      'all'
    ]
  }
});
