import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/rag': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/did': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/facebook': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/webhook': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
