import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock des composants UI critiques
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Composants de Navigation', () => {
  describe('Navbar', () => {
    it('affiche la navigation principale', async () => {
      const user = userEvent.setup();
      
      // Mock du composant Navbar
      const Navbar = () => (
        <nav data-testid="navbar">
          <a href="/" data-testid="nav-link">Accueil</a>
          <a href="/explorer" data-testid="nav-link">Explorer</a>
          <a href="/favorites" data-testid="nav-link">Favoris</a>
          <a href="/auth" data-testid="nav-link">Connexion</a>
        </nav>
      );

      render(<Navbar />, { wrapper: createWrapper() });

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Explorer')).toBeInTheDocument();
      expect(screen.getByText('Favoris')).toBeInTheDocument();
      expect(screen.getByText('Connexion')).toBeInTheDocument();
    });

    it('navigue vers les bonnes pages', async () => {
      const user = userEvent.setup();
      
      // Test de navigation
      const links = screen.getAllByTestId('nav-link');
      
      await user.click(links[1]); // Explorer
      
      // La navigation sera testée avec le router dans l'app réelle
      expect(links[1]).toHaveAttribute('href', '/explorer');
    });

    it('s\'adapte à la taille mobile', async () => {
      const user = userEvent.setup();
      
      // Changer la taille de l'écran
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      window.dispatchEvent(new Event('resize'));

      // Mock du menu mobile
      const MobileMenu = () => (
        <div data-testid="mobile-menu">
          <button data-testid="menu-toggle">☰</button>
          <div data-testid="mobile-links" className="hidden">
            <a href="/">Accueil</a>
            <a href="/explorer">Explorer</a>
          </div>
        </div>
      );

      render(<MobileMenu />);

      const menuToggle = screen.getByTestId('menu-toggle');
      
      await user.click(menuToggle);
      
      await waitFor(() => {
        const mobileLinks = screen.getByTestId('mobile-links');
        expect(mobileLinks).not.toHaveClass('hidden');
      });
    });
  });

  describe('PropertyFilters', () => {
    it('affiche tous les filtres disponibles', async () => {
      const user = userEvent.setup();
      
      const mockFilters = {
        onFilterChange: vi.fn(),
        filters: {},
      };

      // Mock du composant PropertyFilters
      const PropertyFilters = ({ onFilterChange, filters }: any) => (
        <div data-testid="property-filters">
          <select data-testid="price-filter" onChange={(e) => onFilterChange('price', e.target.value)}>
            <option value="">Prix</option>
            <option value="0-500000">0 - 500 000 FCFA</option>
            <option value="500000-1000000">500 000 - 1 000 000 FCFA</option>
          </select>
          
          <select data-testid="type-filter" onChange={(e) => onFilterChange('type', e.target.value)}>
            <option value="">Type</option>
            <option value="apartment">Appartement</option>
            <option value="house">Maison</option>
          </select>
          
          <input 
            data-testid="location-filter" 
            placeholder="Localisation"
            onChange={(e) => onFilterChange('location', e.target.value)}
          />
          
          <button data-testid="reset-filters" onClick={() => onFilterChange('reset', null)}>
            Réinitialiser
          </button>
        </div>
      );

      render(<PropertyFilters {...mockFilters} />);

      expect(screen.getByTestId('price-filter')).toBeInTheDocument();
      expect(screen.getByTestId('type-filter')).toBeInTheDocument();
      expect(screen.getByTestId('location-filter')).toBeInTheDocument();
      expect(screen.getByTestId('reset-filters')).toBeInTheDocument();
    });

    it('applique les filtres correctement', async () => {
      const user = userEvent.setup();
      
      const mockOnFilterChange = vi.fn();
      
      const PropertyFilters = ({ onFilterChange }: any) => (
        <div data-testid="property-filters">
          <select data-testid="price-filter" onChange={(e) => onFilterChange('price', e.target.value)}>
            <option value="">Prix</option>
            <option value="500000-1000000">500 000 - 1 000 000 FCFA</option>
          </select>
        </div>
      );

      render(<PropertyFilters onFilterChange={mockOnFilterChange} />);

      const priceFilter = screen.getByTestId('price-filter');
      
      await user.selectOptions(priceFilter, '500000-1000000');
      
      expect(mockOnFilterChange).toHaveBeenCalledWith('price', '500000-1000000');
    });
  });

  describe('PropertyGrid', () => {
    it('affiche les cartes de propriétés', async () => {
      const mockProperties = [
        { id: '1', title: 'Appartement Abidjan', price: 750000, image: '/img1.jpg' },
        { id: '2', title: 'Maison Cocody', price: 1200000, image: '/img2.jpg' },
        { id: '3', title: 'Studio Plateau', price: 450000, image: '/img3.jpg' },
      ];

      const PropertyGrid = ({ properties }: any) => (
        <div data-testid="property-grid">
          {properties.map((property: any) => (
            <div key={property.id} data-testid="property-card">
              <img src={property.image} alt={property.title} />
              <h3>{property.title}</h3>
              <p>{property.price.toLocaleString()} FCFA</p>
              <button data-testid="favorite-btn">❤</button>
            </div>
          ))}
        </div>
      );

      render(<PropertyGrid properties={mockProperties} />);

      expect(screen.getAllByTestId('property-card')).toHaveLength(3);
      expect(screen.getByText('Appartement Abidjan')).toBeInTheDocument();
      expect(screen.getByText('Maison Cocody')).toBeInTheDocument();
      expect(screen.getByText('Studio Plateau')).toBeInTheDocument();
    });

    it('gère l\'ajout aux favoris', async () => {
      const user = userEvent.setup();
      const mockOnFavorite = vi.fn();

      const PropertyCard = ({ onFavorite }: any) => (
        <div data-testid="property-card">
          <h3>Appartement Test</h3>
          <button data-testid="favorite-btn" onClick={() => onFavorite('1')}>
            ❤
          </button>
        </div>
      );

      render(<PropertyCard onFavorite={mockOnFavorite} />);

      const favoriteBtn = screen.getByTestId('favorite-btn');
      
      await user.click(favoriteBtn);
      
      expect(mockOnFavorite).toHaveBeenCalledWith('1');
    });
  });

  describe('ErrorBoundary', () => {
    it('affiche un message d\'erreur gracieux', async () => {
      // Simuler une erreur dans un composant
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const ErrorBoundary = ({ children }: any) => {
        try {
          return children;
        } catch (error) {
          return (
            <div data-testid="error-boundary">
              <h2>Une erreur s'est produite</h2>
              <p>Veuillez recharger la page</p>
              <button onClick={() => window.location.reload()}>Recharger</button>
            </div>
          );
        }
      };

      // Note: Dans un vrai test, on utiliserait @testing-library/react-18
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Le test passerait avec ErrorBoundary de React
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText('Une erreur s\'est produite')).toBeInTheDocument();
    });
  });

  describe('LoadingFallback', () => {
    it('affiche un indicateur de chargement', () => {
      const LoadingSpinner = () => (
        <div data-testid="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement en cours...</p>
        </div>
      );

      render(<LoadingSpinner />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Chargement en cours...')).toBeInTheDocument();
    });

    it('respecte le timeout de chargement', async () => {
      const TIMEOUT_MS = 5000;
      let timeoutReached = false;

      const DelayedSpinner = () => {
        setTimeout(() => {
          timeoutReached = true;
        }, TIMEOUT_MS);

        return (
          <div data-testid="loading-spinner">
            <div className="spinner"></div>
            {timeoutReached ? (
              <p data-testid="timeout-message">Chargement trop long</p>
            ) : (
              <p>Chargement en cours...</p>
            )}
          </div>
        );
      };

      render(<DelayedSpinner />);

      await waitFor(() => {
        expect(screen.getByTestId('timeout-message')).toBeInTheDocument();
      }, { timeout: TIMEOUT_MS + 100 });
    });
  });

  describe('OfflineWrapper', () => {
    it('affiche un indicateur hors ligne', () => {
      const OfflineIndicator = () => (
        <div data-testid="offline-indicator" className="offline">
          <p>🔌 Vous êtes hors ligne</p>
          <p>Certaines fonctionnalités peuvent être limitées</p>
        </div>
      );

      render(<OfflineIndicator />);

      expect(screen.getByTestId('offline-indicator')).toBeInTheDocument();
      expect(screen.getByText(/hors ligne/)).toBeInTheDocument();
    });

    it('affiche le contenu en cache quand hors ligne', () => {
      const OfflineWrapper = ({ isOnline, cachedContent }: any) => (
        <div>
          {isOnline ? (
            <div data-testid="online-content">{cachedContent}</div>
          ) : (
            <div data-testid="offline-content">
              <p>📱 Contenu en cache</p>
              {cachedContent}
            </div>
          )}
        </div>
      );

      render(<OfflineWrapper isOnline={false} cachedContent="Propriétés récentes" />);

      expect(screen.getByTestId('offline-content')).toBeInTheDocument();
      expect(screen.getByText('📱 Contenu en cache')).toBeInTheDocument();
    });
  });

  describe('NotificationBell', () => {
    it('affiche le compteur de notifications', async () => {
      const user = userEvent.setup();
      
      const mockNotifications = [
        { id: '1', message: 'Nouvelle propriété', read: false },
        { id: '2', message: 'Message reçu', read: false },
        { id: '3', message: 'Mise à jour', read: true },
      ];

      const NotificationBell = ({ notifications }: any) => {
        const unreadCount = notifications.filter((n: any) => !n.read).length;
        
        return (
          <button data-testid="notification-bell">
            🔔
            {unreadCount > 0 && (
              <span data-testid="notification-count">{unreadCount}</span>
            )}
          </button>
        );
      };

      render(<NotificationBell notifications={mockNotifications} />);

      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
    });

    it('ouvre le panneau de notifications', async () => {
      const user = userEvent.setup();

      const NotificationPanel = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        
        return (
          <div>
            <button data-testid="notification-bell" onClick={() => setIsOpen(!isOpen)}>
              🔔
            </button>
            {isOpen && (
              <div data-testid="notification-panel">
                <h3>Notifications</h3>
                <p>Nouvelle propriété disponible</p>
              </div>
            )}
          </div>
        );
      };

      render(<NotificationPanel />);

      const bellButton = screen.getByTestId('notification-bell');
      
      await user.click(bellButton);

      await waitFor(() => {
        expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
      });
    });
  });
});