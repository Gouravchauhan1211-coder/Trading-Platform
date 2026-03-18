import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Market data service - proxies to market-data-service
      '/market': {
        target: 'http://localhost:8082',
        changeOrigin: true
      },
      // Order service - proxies to order-service
      '/api/orders': {
        target: 'http://localhost:8084',
        changeOrigin: true
      },
      // Portfolio service - proxies to portfolio-service
      '/api/portfolio': {
        target: 'http://localhost:8085',
        changeOrigin: true
      },
      // Strategy service - proxies to strategy-engine
      '/api/strategies': {
        target: 'http://localhost:8083',
        changeOrigin: true
      },
      // User service - proxies to user-service
      '/api/users': {
        target: 'http://localhost:8081',
        changeOrigin: true
      },
      // Generic API proxy (fallback for any other /api routes)
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
})
