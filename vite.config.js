import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('react-router-dom')) return 'react-vendor'
          if (id.includes('framer-motion') || id.includes('swiper') || id.includes('lucide-react')) return 'ui-vendor'
          if (id.includes('zustand') || id.includes('@tanstack')) return 'data-vendor'
          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'forms-vendor'
          if (id.includes('@stripe')) return 'stripe-vendor'
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'framer-motion'],
  },
})
