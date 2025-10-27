/**
 * 🎨 MON TOIT DESIGN SYSTEM
 * 
 * Système de design cohérent pour toute la plateforme
 * Couleurs ivoiriennes, typographie, espacements, animations
 */

// ============================================
// 🎨 COULEURS IVOIRIENNES
// ============================================

export const colors = {
  // Couleurs du drapeau ivoirien
  ivorian: {
    orange: '#F77F00',      // Orange principal
    green: '#009E60',       // Vert principal
    white: '#FFFFFF',       // Blanc
  },

  // Palette principale
  primary: {
    DEFAULT: '#3B82F6',     // Bleu principal
    light: '#60A5FA',
    dark: '#2563EB',
    foreground: '#FFFFFF',
  },

  secondary: {
    DEFAULT: '#009E60',     // Vert ivoirien
    light: '#10B981',
    dark: '#047857',
    foreground: '#FFFFFF',
  },

  accent: {
    DEFAULT: '#F77F00',     // Orange ivoirien
    light: '#FB923C',
    dark: '#EA580C',
    foreground: '#FFFFFF',
  },

  // Couleurs sémantiques
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Neutres
  background: '#FFFFFF',
  foreground: '#0F172A',
  muted: {
    DEFAULT: '#F1F5F9',
    foreground: '#64748B',
  },
  border: '#E2E8F0',
} as const;

// ============================================
// 📐 ESPACEMENTS
// ============================================

export const spacing = {
  // Espacements de base (multiples de 4px)
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  '4xl': '6rem',   // 96px

  // Espacements de section
  section: {
    padding: {
      mobile: '2rem 1rem',    // 32px vertical, 16px horizontal
      tablet: '3rem 2rem',    // 48px vertical, 32px horizontal
      desktop: '4rem 4rem',   // 64px vertical, 64px horizontal
    },
    gap: {
      mobile: '2rem',   // 32px
      tablet: '3rem',   // 48px
      desktop: '4rem',  // 64px
    },
  },

  // Espacements de carte
  card: {
    padding: {
      sm: '1rem',      // 16px
      md: '1.5rem',    // 24px
      lg: '2rem',      // 32px
    },
    gap: '1rem',       // 16px
  },
} as const;

// ============================================
// 🔤 TYPOGRAPHIE
// ============================================

export const typography = {
  // Tailles de police
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },

  // Poids de police
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Hauteur de ligne
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },

  // Familles de police
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    heading: 'Inter, system-ui, -apple-system, sans-serif',
  },
} as const;

// ============================================
// 🎭 ANIMATIONS
// ============================================

export const animations = {
  // Durées
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Timing functions
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Transitions communes
  transition: {
    all: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 300ms cubic-bezier(0.4, 0, 0.2, 1), background-color 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================
// 📦 COMPOSANTS
// ============================================

export const components = {
  // Boutons
  button: {
    height: {
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px
      lg: '3rem',      // 48px
    },
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
    },
    borderRadius: '0.5rem',  // 8px
  },

  // Cartes
  card: {
    borderRadius: '0.75rem',  // 12px
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  },

  // Badges
  badge: {
    height: '1.5rem',         // 24px
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',   // Pill shape
    fontSize: '0.75rem',      // 12px
  },

  // Inputs
  input: {
    height: '2.5rem',         // 40px
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',   // 8px
    borderWidth: '1px',
  },
} as const;

// ============================================
// 🎯 BREAKPOINTS
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// 🌈 DÉGRADÉS IVOIRIENS
// ============================================

export const gradients = {
  // Dégradé principal (Orange → Vert)
  primary: 'linear-gradient(135deg, #F77F00 0%, #009E60 100%)',
  
  // Dégradé inversé (Vert → Orange)
  primaryReverse: 'linear-gradient(135deg, #009E60 0%, #F77F00 100%)',
  
  // Dégradé horizontal (Orange → Vert)
  horizontal: 'linear-gradient(90deg, #F77F00 0%, #009E60 100%)',
  
  // Dégradé vertical (Orange → Vert)
  vertical: 'linear-gradient(180deg, #F77F00 0%, #009E60 100%)',
  
  // Dégradé subtil (avec transparence)
  subtle: 'linear-gradient(135deg, rgba(247, 127, 0, 0.1) 0%, rgba(0, 158, 96, 0.1) 100%)',
  
  // Dégradé overlay (pour texte)
  overlay: 'linear-gradient(135deg, rgba(247, 127, 0, 0.9) 0%, rgba(0, 158, 96, 0.9) 100%)',
} as const;

// ============================================
// 📏 LAYOUT
// ============================================

export const layout = {
  // Largeurs de container
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Largeurs max pour le contenu
  maxWidth: {
    prose: '65ch',      // Pour le texte
    content: '1280px',  // Pour le contenu principal
    wide: '1536px',     // Pour les sections larges
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

// ============================================
// 🎨 CLASSES UTILITAIRES
// ============================================

export const utilityClasses = {
  // Dégradé de texte ivoirien
  textGradient: 'bg-clip-text text-transparent bg-gradient-to-r from-[#F77F00] to-[#009E60]',
  
  // Dégradé de fond ivoirien
  bgGradient: 'bg-gradient-to-r from-[#F77F00] to-[#009E60]',
  
  // Ombre de texte
  textShadow: 'drop-shadow-sm',
  
  // Transition par défaut
  transition: 'transition-all duration-300 ease-in-out',
  
  // Hover scale
  hoverScale: 'hover:scale-105 transition-transform duration-300',
  
  // Focus ring
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
} as const;

// ============================================
// 🎯 HELPER FUNCTIONS
// ============================================

/**
 * Génère une classe CSS pour un dégradé ivoirien
 */
export function getIvorianGradient(direction: 'horizontal' | 'vertical' | 'diagonal' = 'diagonal'): string {
  switch (direction) {
    case 'horizontal':
      return 'bg-gradient-to-r from-[#F77F00] to-[#009E60]';
    case 'vertical':
      return 'bg-gradient-to-b from-[#F77F00] to-[#009E60]';
    case 'diagonal':
    default:
      return 'bg-gradient-to-br from-[#F77F00] to-[#009E60]';
  }
}

/**
 * Génère une classe CSS pour un espacement responsive
 */
export function getResponsivePadding(size: 'sm' | 'md' | 'lg' = 'md'): string {
  switch (size) {
    case 'sm':
      return 'px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16';
    case 'md':
      return 'px-4 py-12 md:px-8 md:py-16 lg:px-16 lg:py-24';
    case 'lg':
      return 'px-4 py-16 md:px-12 md:py-24 lg:px-24 lg:py-32';
  }
}

/**
 * Génère une classe CSS pour un container responsive
 */
export function getResponsiveContainer(): string {
  return 'container mx-auto px-4 md:px-8 lg:px-16';
}

export default {
  colors,
  spacing,
  typography,
  animations,
  components,
  breakpoints,
  gradients,
  layout,
  utilityClasses,
  getIvorianGradient,
  getResponsivePadding,
  getResponsiveContainer,
};

