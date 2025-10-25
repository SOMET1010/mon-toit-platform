import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { VitePWA } from 'vite-plugin-pwa';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin } from 'vite';

// Configuration pour l'analyse du bundle
export default defineConfig(({ mode }) => {
  const plugins: any[] = [react(), componentTagger(), splitVendorChunkPlugin()];
  
  // Ajouter le bundle analyzer en mode développement
  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    );
  }
  
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
  
  return {
    base: process.env.CAPACITOR === 'true' ? './' : '/',
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development' ? true : false,
      target: 'es2020',
      minify: 'esbuild',
      rollupOptions: {
        external: (id) => {
          return id.startsWith('@capacitor/');
        },
        output: {
          manualChunks: {
            // Séparer les grosses dépendances en chunks distincts
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': [
              '@radix-ui/react-dialog', 
              '@radix-ui/react-dropdown-menu', 
              '@radix-ui/react-select',
              '@radix-ui/react-toast',
              '@radix-ui/react-tabs',
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox'
            ],
            'query-vendor': ['@tanstack/react-query'],
            'map-vendor': ['mapbox-gl', '@mapbox/mapbox-gl-draw', '@mapbox/mapbox-gl-geocoder'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'chart-vendor': ['recharts'],
            'date-vendor': ['date-fns'],
            'icons-vendor': ['lucide-react'],
            'cap-vendor': [
              '@capacitor/android', '@capacitor/app', '@capacitor/core', 
              '@capacitor/ios', '@capacitor/browser'
            ],
            'security-vendor': ['@sentry/react', 'crypto-js'],
            'geo-vendor': ['@turf/turf', 'supercluster'],
            'media-vendor': [
              '@photo-sphere-viewer/core', 
              'react-player', 
              'swiper', 
              'embla-carousel-react'
            ],
            'motion-vendor': ['framer-motion', '@react-spring/web']
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/styles-[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|svg|webp)$/i.test(assetInfo.name || '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096, // Inline assets plus petits que 4KB
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['@capacitor/core']
    },
    ssr: {
      noExternal: ['@radix-ui/react-*', '@photo-sphere-viewer/*']
    }
  };
});