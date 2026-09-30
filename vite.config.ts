import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    // The site calls /api/* on its own origin, which is how Vercel serves it.
    // The dev server has nothing behind that path, so it is forwarded to the
    // local API server (`npm run serve:api`) when one is running on 4173.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY ?? 'http://localhost:4173',
        // Keep the browser's Host header: the API checks Origin against it.
        changeOrigin: false,
      },
    },
  },
})
