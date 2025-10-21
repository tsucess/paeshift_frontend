import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  const API_BASE_URL = env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

  return {
    plugins: [react()],

    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@services': resolve(__dirname, 'src/services'),
        '@auth': resolve(__dirname, 'src/auth'),
        '@hooks': resolve(__dirname, 'src/hooks'),
      },
    },

    // Development server configuration
    server: {
      host: '0.0.0.0', // Allow external connections
      port: 3000,
      strictPort: true,
      cors: true,
      open: true, // Auto-open browser
      historyApiFallback: true, // Enable client-side routing fallback
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'paeshift-frontend.onrender.com',
        '*.onrender.com',
      ],
      proxy: {
        // Proxy API requests to Django backend
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/admin': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
        '/accountsapp': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },

      }
    },

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      target: 'es2015',

      // Code splitting for better performance
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
            'form-vendor': ['formik', 'yup'],
            'query-vendor': ['@tanstack/react-query'],
            'map-vendor': ['@react-google-maps/api', 'google-map-react'],
            'notification-vendor': ['react-toastify', 'sweetalert2'],
            'icon-vendor': ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons', '@fortawesome/free-regular-svg-icons'],
          },
        },
      },

      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },

    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'formik',
        'yup',
        '@tanstack/react-query',
      ],
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  }
})

