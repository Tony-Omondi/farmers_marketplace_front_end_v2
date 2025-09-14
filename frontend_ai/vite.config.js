import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    host: true,              // Serve on all network interfaces
    allowedHosts: 'all',     // Allow requests from any host
    cors: true,              // Allow all CORS requests
    strictPort: false,       // Let Vite pick another port if 5173 is busy
    open: true,              // Auto-open browser
  }
})
