import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',	
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB limit
        skipWaiting: true,
        clientsClaim: true,
        // Prevent service worker from hijacking static HTML page loads inside iframes
        navigateFallbackDenylist: [
          /^\/reports\//,
          /^\/nfc-login\//,
          /CareInn Welcome Slideshow\.html$/
        ],
        // Hospital API is http:// — service workers can only cache HTTPS,
        // so it's implicitly excluded from runtime caching.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'careinn-app-shell',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'CareInn',
        short_name: 'CareInn',
        description: 'Hospital Bedside Kiosk',
        theme_color: '#008AAB',
        background_color: '#0F1923',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64',
            type: 'image/x-icon',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
build: {
    chunkSizeWarningLimit: 2000,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-ui': ['@radix-ui/react-slider', 'lucide-react', 'motion'],
          'vendor-pdf': ['react-pdf', 'pdfjs-dist'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@emotion/is-prop-valid'],
  },
  server: {
    headers: {
      'bypass-tunnel-reminder': 'true',
    },
  },
})
