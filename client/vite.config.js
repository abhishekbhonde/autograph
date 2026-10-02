import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['path', 'fs', 'buffer', 'events', 'stream', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    __dirname: '"/"',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://autograph-9cm9.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
