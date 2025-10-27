import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.CAPACITOR === 'true' ? './' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: (() => {
    const plugins: any[] = [react(), componentTagger()];
    
    plugins.push(VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png', 'robots.txt'],
      manifest: {
        name: 'Mon Toit - Plateforme Immobilière ANSUT',
        short_name: 'Mon Toit',
        description: 'Le logement, en toute confiance. Location sécurisée en Côte d\'Ivoire',
        theme_color: '#FF8F00',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2,webp}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/btxhuqtirylvkgvoutoc\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/btxhuqtirylvkgvoutoc\.supabase\.co\/storage\/v1\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }));
    
    // Add Sentry in production mode for error tracking
    if (mode === "production") {
      plugins.push(sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }));
    }
    
    return plugins;
  })(),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development', // Only enable sourcemaps in development
    target: 'es2020',
    minify: mode === 'production' ? 'esbuild' : false,
    reportCompressedSize: false, // Disable to speed up build
    rollupOptions: {
      external: (id) => {
        // Externalize Capacitor modules for web builds
        return id.startsWith('@capacitor/');
      },
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          // Core React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Components
          'ui-vendor': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip'
          ],
          
          // Data fetching and state management
          'query-vendor': ['@tanstack/react-query'],
          
          // Mapping and geolocation
          'map-vendor': ['mapbox-gl', '@mapbox/mapbox-gl-draw', '@mapbox/mapbox-gl-geocoder', 'supercluster'],
          
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js', '@supabase/ssr'],
          
          // Charts and visualizations
          'charts-vendor': ['recharts', 'd3-scale', 'd3-shape'],
          
          // Date handling
          'date-vendor': ['date-fns'],
          
          // Forms
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Utilities
          'utils-vendor': ['clsx', 'class-variance-authority', 'tailwind-merge', 'lodash', 'ramda'],
          
          // Media and multimedia
          'media-vendor': ['@photo-sphere-viewer/core', 'react-player', 'swiper', 'embla-carousel-react']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(woff|woff2|ttf|eot)$/)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    chunkSizeWarningLimit: 1500, // Increased limit for better optimization
  },
  // Enhanced dependency optimization
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'date-fns',
      'clsx'
    ],
    exclude: [
      // Exclude heavy libraries that should be loaded on-demand
      'mapbox-gl',
      '@photo-sphere-viewer/core',
      'react-player'
    ]
  },
  // Performance optimizations
  esbuild: {
    // Drop console.log statements in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  // Worker configuration
  worker: {
    format: 'es'
  },
}));

