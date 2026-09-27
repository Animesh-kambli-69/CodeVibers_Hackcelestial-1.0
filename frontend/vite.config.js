import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react(),
  ],
  define: {
    // When Render builds the frontend, it sets VITE_API_BASE_URL as an env var
    // in the service settings — this ensures the production URL is baked in at build time.
    // Falls back to localhost for local dev.
  },
  server: {
    port: 5173,
  },
  build: {
    // Sourcemaps off in production to reduce bundle size
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
            return 'router-vendor';
          }
        },
      },
    },
  },
}))
