/**
 * Visual Layers - Background Contexts
 * 
 * Defines consistent background treatments for different contexts
 * to create visual depth and hierarchy across the application.
 */

export const visualLayers = {
  hero: {
    background: "bg-gradient-mesh",
    overlay: "absolute inset-0 bg-gradient-to-br from-background/50 via-background/30 to-background/50",
    shapes: {
      primary: "absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float",
      secondary: "absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float-delayed",
    }
  },
  
  section: {
    primary: "bg-gradient-section-primary relative overflow-hidden",
    secondary: "bg-gradient-section-secondary relative overflow-hidden",
    alternating: true, // Indicates sections should alternate styles
    decorative: {
      topRight: "absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl",
      bottomLeft: "absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl",
    }
  },
  
  cards: {
    elevated: "bg-card shadow-soft hover:shadow-elevated border border-primary/10 transition-all duration-500",
    glass: "bg-card/80 backdrop-blur-xl border border-white/20 shadow-glass",
    gradient: "bg-gradient-card border border-primary/10 shadow-soft",
    interactive: "group relative overflow-hidden hover:scale-[1.02] transition-all duration-500 hover:border-primary/30",
  },
  
  effects: {
    shine: "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000",
    glow: "group-hover:shadow-primary transition-all duration-300",
    blur: "backdrop-blur-xl",
  }
} as const;

// Helper to get alternating section styles
export const getSectionStyle = (index: number) => {
  return index % 2 === 0 
    ? visualLayers.section.primary 
    : visualLayers.section.secondary;
};

// Helper to get card style with effects
export const getCardStyle = (variant: 'elevated' | 'glass' | 'gradient' = 'elevated', interactive = true) => {
  const base = visualLayers.cards[variant];
  return interactive ? `${base} ${visualLayers.cards.interactive}` : base;
};
