import React from 'react';
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import App from "./App.tsx";
import "./index.css";
import "./styles/design-system.css";

// Lazy initialization pour les fonctionnalités non-critiques
const initializeOptionalFeatures = async () => {
  // Importer Sentry uniquement en production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    try {
      const Sentry = await import("@sentry/react");
      const { initPerformanceMonitoring } = await import('@/lib/analytics');
      const { secureStorage } = await import('@/lib/secureStorage');
      
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN || "",
        environment: import.meta.env.MODE,
        
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        
        beforeSend(event, hint) {
          const userId = secureStorage.getItem('supabase.auth.token', true);
          if (userId) {
            event.user = { ...event.user, id: userId };
          }
          
          if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
            return null;
          }
          
          return event;
        },
        
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          'ChunkLoadError',
        ],
      });

      initPerformanceMonitoring();
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
    }
  }

  // Importer les fonctionnalités mobiles uniquement si nécessaire
  try {
    const { Capacitor } = await import('@capacitor/core');
    
    if (Capacitor.isNativePlatform()) {
      const { migrateToSecureStorage } = await import('@/lib/secureStorage');
      const { initializeWebViewSecurity } = await import('@/lib/webviewSecurity');
      const { initializeDeviceSecurity } = await import('@/lib/deviceSecurity');
      const { initializeMobilePlugins, logPluginReport } = await import('@/lib/mobilePlugins');
      const { MobileNotificationService } = await import('@/lib/mobileNotifications');
      const { MobileFileSystemService } = await import('@/lib/mobileFileSystem');
      const { MobileNetworkService } = await import('@/lib/mobileNetwork');

      migrateToSecureStorage();
      initializeWebViewSecurity();
      initializeDeviceSecurity();
      initializeMobilePlugins();
      logPluginReport();

      // Initialize mobile services
      const notificationService = MobileNotificationService.getInstance();
      await notificationService.initialize();

      const fileSystemService = MobileFileSystemService.getInstance();
      await fileSystemService.initialize();

      const networkService = MobileNetworkService.getInstance();
      await networkService.initialize();

      console.log('✅ All mobile services initialized successfully');
    }
  } catch (error) {
    console.warn('Mobile features not available:', error);
  }
};

// Render l'application immédiatement
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Initialiser les fonctionnalités optionnelles après le rendu
initializeOptionalFeatures();

