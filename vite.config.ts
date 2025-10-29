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
    
    // Only add Sentry in production mode - DISABLED for now to reduce build size
    // if (mode === "production") {
    //   plugins.push(sentryVitePlugin({
    //     org: process.env.SENTRY_ORG,
    //     project: process.env.SENTRY_PROJECT,
    //     authToken: process.env.SENTRY_AUTH_TOKEN,
    //   }));
    // }
    
    return plugins;
  })(),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Désactiver les sourcemaps pour réduire la mémoire
    target: 'es2020',
    minify: 'esbuild', // Plus rapide et moins gourmand en mémoire que terser
    rollupOptions: {
      external: (id) => {
        // Externaliser tous les modules Capacitor pour le build web
        return id.startsWith('@capacitor/');
      },
      output: {
        // DÉSACTIVER inlineDynamicImports pour permettre le code splitting
        // inlineDynamicImports: true,
        // Forcer un nouveau hash à chaque build avec timestamp
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        manualChunks: {
          // Séparer les grosses dépendances en chunks distincts
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'query-vendor': ['@tanstack/react-query'],
          'map-vendor': ['mapbox-gl'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return `assets/styles-[hash]-${Date.now()}[extname]`;
          }
          return `assets/[name]-[hash]-${Date.now()}[extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  // Optimisations supplémentaires
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
}));

