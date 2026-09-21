import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('add-to-calendar-button')) {
              return 'vendor-calendar'
            }
            if (id.includes('sweetalert2')) {
              return 'vendor-swal'
            }
            if (id.includes('html5-qrcode') || id.includes('qrcode.react')) {
              return 'vendor-qrcode'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer'
            }
            if (id.includes('gsap') || id.includes('@gsap')) {
              return 'vendor-gsap'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/') || id.endsWith('/react')) {
              return 'vendor-react'
            }
            return 'vendor-misc'
          }
        }
      }
    }
  }
})
