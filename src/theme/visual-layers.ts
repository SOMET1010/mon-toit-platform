/**
 * Visual Layers - Background Contexts & Design System
 * 
 * Defines consistent background treatments, effects, and visual hierarchy
 * across the application with full TypeScript support.
 * 
 * @example
 * import { visualLayers, getSectionStyle, composeStyles } from './visual-layers';
 * 
 * const heroClasses = composeStyles(
 *   visualLayers.hero.background,
 *   visualLayers.effects.blur
 * );
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type CardVariant = 'elevated' | 'glass' | 'gradient' | 'outlined' | 'flat';
export type SectionVariant = 'primary' | 'secondary' | 'accent' | 'muted';
export type EffectType = 'shine' | 'glow' | 'blur' | 'shimmer' | 'pulse';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export interface StyleComposition {
  base: string;
  effects?: string[];
  animations?: string[];
}

export interface DecorativeShape {
  className: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// ============================================================================
// Animation Presets
// ============================================================================

export const animations = {
  float: {
    slow: 'animate-float-slow',
    normal: 'animate-float',
    fast: 'animate-float-fast',
  },
  pulse: {
    slow: 'animate-pulse-slow',
    normal: 'animate-pulse',
    fast: 'animate-pulse-fast',
  },
  shimmer: 'animate-shimmer',
  fadeIn: {
    slow: 'animate-fade-in-slow',
    normal: 'animate-fade-in',
    fast: 'animate-fade-in-fast',
  },
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
} as const;

// ============================================================================
// Visual Layers Configuration
// ============================================================================

export const visualLayers = {
  /**
   * Hero Section Backgrounds
   * Large, immersive backgrounds for landing sections
   */
  hero: {
    background: 'bg-gradient-mesh relative',
    overlay: 'absolute inset-0 bg-gradient-to-br from-background/50 via-background/30 to-background/50',
    shapes: {
      primary: 'absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float',
      secondary: 'absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float-delayed',
      accent: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl',
    },
    variants: {
      default: 'bg-gradient-mesh',
      dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
      colorful: 'bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20',
      minimal: 'bg-background',
    }
  },

  /**
   * Section Backgrounds
   * Consistent backgrounds for content sections
   */
  section: {
    primary: 'bg-gradient-section-primary relative overflow-hidden',
    secondary: 'bg-gradient-section-secondary relative overflow-hidden',
    accent: 'bg-gradient-to-br from-accent/5 via-background to-accent/5 relative overflow-hidden',
    muted: 'bg-muted/30 relative overflow-hidden',
    alternating: true,
    
    decorative: {
      topRight: 'absolute -top-48 -right-48 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none',
      topLeft: 'absolute -top-48 -left-48 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none',
      bottomRight: 'absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none',
      bottomLeft: 'absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl pointer-events-none',
      center: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/3 rounded-full blur-3xl pointer-events-none',
    },

    // Spacing presets for sections
    spacing: {
      sm: 'py-12 md:py-16',
      md: 'py-16 md:py-24',
      lg: 'py-24 md:py-32',
      xl: 'py-32 md:py-40',
    }
  },

  /**
   * Card Styles
   * Various card treatments for different contexts
   */
  cards: {
    elevated: 'bg-card shadow-soft hover:shadow-elevated border border-primary/10 transition-all duration-500',
    glass: 'bg-card/80 backdrop-blur-xl border border-white/20 shadow-glass',
    gradient: 'bg-gradient-card border border-primary/10 shadow-soft',
    outlined: 'bg-transparent border-2 border-primary/20 hover:border-primary/40 transition-all duration-300',
    flat: 'bg-card border border-border',
    
    // Interactive states
    interactive: 'group relative overflow-hidden hover:scale-[1.02] transition-all duration-500 hover:border-primary/30 cursor-pointer',
    selectable: 'group relative overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all duration-300 cursor-pointer',
    
    // Size variants
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    },
    
    // Rounding variants
    rounded: {
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-xl',
      xl: 'rounded-2xl',
      full: 'rounded-3xl',
    }
  },

  /**
   * Visual Effects
   * Reusable effect classes for enhanced interactions
   */
  effects: {
    shine: 'absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none',
    glow: 'group-hover:shadow-primary transition-all duration-300',
    glowStrong: 'group-hover:shadow-primary-strong transition-all duration-300',
    blur: 'backdrop-blur-xl',
    blurSm: 'backdrop-blur-sm',
    blurLg: 'backdrop-blur-2xl',
    shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-shimmer',
    pulse: 'animate-pulse',
    
    // Hover effects
    hoverLift: 'hover:-translate-y-1 transition-transform duration-300',
    hoverGrow: 'hover:scale-105 transition-transform duration-300',
    hoverShrink: 'hover:scale-95 transition-transform duration-200',
    
    // Focus states
    focusRing: 'focus:ring-2 focus:ring-primary/50 focus:outline-none',
    focusRingOffset: 'focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:outline-none',
  },

  /**
   * Gradient Overlays
   * Reusable gradient overlay patterns
   */
  gradients: {
    radial: {
      center: 'bg-gradient-radial from-primary/10 via-transparent to-transparent',
      topLeft: 'bg-gradient-radial-tl from-primary/10 via-transparent to-transparent',
      topRight: 'bg-gradient-radial-tr from-secondary/10 via-transparent to-transparent',
    },
    linear: {
      toRight: 'bg-gradient-to-r from-primary/20 to-secondary/20',
      toBottom: 'bg-gradient-to-b from-primary/20 to-transparent',
      diagonal: 'bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20',
    },
    mesh: {
      default: 'bg-gradient-mesh',
      colorful: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-pink-500/10 to-blue-500/20',
    }
  },

  /**
   * Text Treatments
   * Reusable text styling patterns
   */
  text: {
    gradient: {
      primary: 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent',
      accent: 'bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent',
      rainbow: 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent',
    },
    glow: 'text-shadow-glow',
    emphasized: 'font-semibold tracking-tight',
  }
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get alternating section styles based on index
 * @param index - The section index (0-based)
 * @param variant - Optional specific variant to use
 */
export const getSectionStyle = (
  index: number, 
  variant?: SectionVariant
): string => {
  if (variant) {
    return visualLayers.section[variant];
  }
  
  return index % 2 === 0 
    ? visualLayers.section.primary 
    : visualLayers.section.secondary;
};

/**
 * Get card style with optional effects and configurations
 * @param variant - Card style variant
 * @param options - Additional options for the card
 */
export const getCardStyle = (
  variant: CardVariant = 'elevated',
  options: {
    interactive?: boolean;
    selectable?: boolean;
    padding?: keyof typeof visualLayers.cards.padding;
    rounded?: keyof typeof visualLayers.cards.rounded;
    effects?: EffectType[];
  } = {}
): string => {
  const {
    interactive = true,
    selectable = false,
    padding = 'md',
    rounded = 'lg',
    effects = []
  } = options;

  const styles: string[] = [
    visualLayers.cards[variant],
    visualLayers.cards.padding[padding],
    visualLayers.cards.rounded[rounded],
  ];

  if (interactive) {
    styles.push(visualLayers.cards.interactive);
  }

  if (selectable) {
    styles.push(visualLayers.cards.selectable);
  }

  effects.forEach(effect => {
    if (effect in visualLayers.effects) {
      styles.push(visualLayers.effects[effect]);
    }
  });

  return styles.join(' ');
};

/**
 * Compose multiple style strings into one
 * @param styles - Array of style strings to combine
 */
export const composeStyles = (...styles: (string | undefined | null | false)[]): string => {
  return styles.filter(Boolean).join(' ');
};

/**
 * Get decorative shape with custom positioning
 * @param position - Position of the decorative shape
 * @param color - Color variant (primary, secondary, accent)
 * @param size - Size of the shape
 */
export const getDecorativeShape = (
  position: DecorativeShape['position'],
  color: 'primary' | 'secondary' | 'accent' = 'primary',
  size: DecorativeShape['size'] = 'lg'
): string => {
  const sizeMap = {
    sm: 'w-64 h-64',
    md: 'w-96 h-96',
    lg: 'w-[500px] h-[500px]',
    xl: 'w-[700px] h-[700px]',
  };

  const positionMap = {
    'top-left': '-top-48 -left-48',
    'top-right': '-top-48 -right-48',
    'bottom-left': '-bottom-48 -left-48',
    'bottom-right': '-bottom-48 -right-48',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return composeStyles(
    'absolute',
    positionMap[position],
    sizeMap[size],
    `bg-${color}/5`,
    'rounded-full',
    'blur-3xl',
    'pointer-events-none',
    animations.float.slow
  );
};

/**
 * Create a container with consistent spacing and max-width
 * @param size - Container size variant
 */
export const getContainerStyle = (
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg'
): string => {
  const sizeMap = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1440px]',
    full: 'max-w-full',
  };

  return composeStyles(
    'mx-auto',
    'px-4 sm:px-6 lg:px-8',
    sizeMap[size]
  );
};

/**
 * Apply animation with custom speed
 * @param type - Animation type
 * @param speed - Animation speed
 */
export const getAnimation = (
  type: keyof typeof animations,
  speed: AnimationSpeed = 'normal'
): string => {
  const animation = animations[type];
  
  if (typeof animation === 'string') {
    return animation;
  }
  
  return animation[speed];
};

// ============================================================================
// Advanced Composition Utilities
// ============================================================================

/**
 * Create a hero section with all necessary elements
 */
export const createHeroSection = (
  variant: keyof typeof visualLayers.hero.variants = 'default',
  includeShapes: boolean = true
): StyleComposition => {
  const base = composeStyles(
    visualLayers.hero.variants[variant],
    'relative',
    'overflow-hidden'
  );

  const effects: string[] = [visualLayers.hero.overlay];
  
  if (includeShapes) {
    effects.push(
      visualLayers.hero.shapes.primary,
      visualLayers.hero.shapes.secondary
    );
  }

  return { base, effects };
};

/**
 * Create a feature card with consistent styling
 */
export const createFeatureCard = (
  options: {
    variant?: CardVariant;
    withGlow?: boolean;
    withShine?: boolean;
  } = {}
): string => {
  const { variant = 'glass', withGlow = true, withShine = true } = options;
  
  const effects: EffectType[] = [];
  if (withGlow) effects.push('glow');
  if (withShine) effects.push('shine');

  return getCardStyle(variant, {
    interactive: true,
    padding: 'lg',
    rounded: 'xl',
    effects,
  });
};

// ============================================================================
// Export All
// ============================================================================

export default visualLayers;
