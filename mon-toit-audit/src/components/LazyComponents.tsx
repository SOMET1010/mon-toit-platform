import React, { Suspense, lazy } from 'react';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

// Hook pour le lazy loading avec retry
const useLazyComponent = (importFunc: () => Promise<any>) => {
  const [retryCount, setRetryCount] = React.useState(0);
  const [error, setError] = React.useState<Error | null>(null);
  
  const LazyComponent = React.lazy(async () => {
    try {
      const component = await importFunc();
      return component;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  });
  
  const retry = React.useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
  }, []);
  
  return { LazyComponent, error, retry, retryCount };
};

// Composant de lazy loading avec fallback personnalisé
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <LoadingFallback />,
  errorFallback,
  onError
}) => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
      onError?.(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  if (error && errorFallback) {
    return errorFallback;
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Composants avec lazy loading pour optimisation du bundle
export const LazyMapComponent = React.lazy(() => 
  import('@/components/ExploreMap').then(module => ({
    default: module.ExploreMap
  }))
);

export const LazyPropertyGrid = React.lazy(() => 
  import('@/components/PropertyGrid').then(module => ({
    default: module.PropertyGrid
  }))
);

export const LazyPropertyFilters = React.lazy(() => 
  import('@/components/PropertyFilters').then(module => ({
    default: module.PropertyFilters
  }))
);

export const LazyPropertyMap = React.lazy(() => 
  import('@/components/PropertyMap').then(module => ({
    default: module.PropertyMap
  }))
);

export const LazyNotificationBell = React.lazy(() => 
  import('@/components/NotificationBell').then(module => ({
    default: module.NotificationBell
  }))
);

export const LazyOnboardingModal = React.lazy(() => 
  import('@/components/OnboardingModal').then(module => ({
    default: module.OnboardingModal
  }))
);

export const LazyPushNotificationSetup = React.lazy(() => 
  import('@/components/PushNotificationSetup').then(module => ({
    default: module.PushNotificationSetup
  }))
);

// Lazy loading pour les pages lourdes
export const LazyAdminDashboard = React.lazy(() => 
  import('@/pages/AdminDashboard').then(module => ({
    default: module.AdminDashboard
  }))
);

export const LazyAgencyDashboard = React.lazy(() => 
  import('@/pages/AgencyDashboard').then(module => ({
    default: module.AgencyDashboard
  }))
);

export const LazyMyProperties = React.lazy(() => 
  import('@/pages/MyProperties').then(module => ({
    default: module.MyProperties
  }))
);

export const LazyMyMandates = React.lazy(() => 
  import('@/pages/MyMandates').then(module => ({
    default: module.MyMandates
  }))
);

export const LazyMessages = React.lazy(() => 
  import('@/pages/Messages').then(module => ({
    default: module.Messages
  }))
);

export const LazyApplications = React.lazy(() => 
  import('@/pages/Applications').then(module => ({
    default: module.Applications
  }))
);

export const LazyLeases = React.lazy(() => 
  import('@/pages/Leases').then(module => ({
    default: module.Leases
  }))
);

// Lazy loading pour les composants média lourds
export const LazyPhotoSphereViewer = React.lazy(() => 
  import('@/components/property/PhotoSphereViewer').then(module => ({
    default: module.PhotoSphereViewer
  }))
);

export const LazyVideoPlayer = React.lazy(() => 
  import('@/components/media/VideoPlayer').then(module => ({
    default: module.VideoPlayer
  }))
);

export const LazyImageGallery = React.lazy(() => 
  import('@/components/media/ImageGallery').then(module => ({
    default: module.ImageGallery
  }))
);

// Hook pour précharger les composants critiques
export const usePreloadComponents = () => {
  const preloadComponent = React.useCallback((importFunc: () => Promise<any>) => {
    // Précharger de manière asynchrone sans bloquer l'UI
    importFunc().catch(() => {
      // Ignorer les erreurs de préchargement
    });
  }, []);

  React.useEffect(() => {
    // Précharger les composants critiques après le chargement initial
    const timer = setTimeout(() => {
      preloadComponent(() => import('@/components/PropertyGrid'));
      preloadComponent(() => import('@/components/PropertyFilters'));
    }, 2000);

    return () => clearTimeout(timer);
  }, [preloadComponent]);
};

// Composant HOC pour le lazy loading avec gestion d'erreur
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ReactNode,
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>
) => {
  return function LazyComponent(props: P) {
    const { LazyComponent, error, retry } = useLazyComponent(importFunc);

    if (error && errorFallback) {
      const ErrorComponent = errorFallback;
      return <ErrorComponent error={error} retry={retry} />;
    }

    return (
      <LazyWrapper fallback={fallback}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
};

// Configuration du lazy loading par niveau de priorité
export const lazyLoadConfig = {
  // Priorité haute - Charger immédiatement
  high: [
    'LazyPropertyGrid',
    'LazyPropertyFilters',
    'LazyNotificationBell'
  ],
  
  // Priorité moyenne - Charger après interaction
  medium: [
    'LazyPropertyMap',
    'LazyMessages',
    'LazyApplications'
  ],
  
  // Priorité basse - Charger à la demande
  low: [
    'LazyAdminDashboard',
    'LazyAgencyDashboard',
    'LazyPhotoSphereViewer',
    'LazyVideoPlayer'
  ]
};

// Hook pour gérer le lazy loading selon la priorité
export const useLazyLoadingStrategy = () => {
  const [loadedComponents, setLoadedComponents] = React.useState<Set<string>>(new Set());

  const loadComponentByPriority = React.useCallback((priority: keyof typeof lazyLoadConfig) => {
    const components = lazyLoadConfig[priority];
    components.forEach(componentName => {
      if (!loadedComponents.has(componentName)) {
        const importFunc = getComponentImport(componentName);
        if (importFunc) {
          importFunc().then(() => {
            setLoadedComponents(prev => new Set([...prev, componentName]));
          });
        }
      }
    });
  }, [loadedComponents]);

  // Fonction pour obtenir la fonction d'import correspondante
  const getComponentImport = (componentName: string) => {
    const imports: Record<string, () => Promise<any>> = {
      'LazyPropertyGrid': () => import('@/components/PropertyGrid'),
      'LazyPropertyFilters': () => import('@/components/PropertyFilters'),
      'LazyNotificationBell': () => import('@/components/NotificationBell'),
      'LazyPropertyMap': () => import('@/components/PropertyMap'),
      'LazyMessages': () => import('@/pages/Messages'),
      'LazyApplications': () => import('@/pages/Applications'),
      'LazyAdminDashboard': () => import('@/pages/AdminDashboard'),
      'LazyAgencyDashboard': () => import('@/pages/AgencyDashboard'),
      'LazyPhotoSphereViewer': () => import('@/components/property/PhotoSphereViewer'),
      'LazyVideoPlayer': () => import('@/components/media/VideoPlayer')
    };
    
    return imports[componentName];
  };

  return {
    loadComponentByPriority,
    loadedComponents,
    isComponentLoaded: (componentName: string) => loadedComponents.has(componentName)
  };
};

// Export des composants avec lazy loading configuré
export {
  LazyWrapper as LazyLoad,
  useLazyComponent as useLazyLoading,
  usePreloadComponents,
  useLazyLoadingStrategy
};

export default LazyWrapper;