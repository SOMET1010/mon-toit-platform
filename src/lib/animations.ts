/**
 * Animations et transitions réutilisables pour Mon Toit
 * Utilise Tailwind CSS et des classes personnalisées
 */

// Classes d'animation Tailwind à ajouter aux composants
export const animations = {
  // Fade in animations
  fadeIn: "animate-fade-in",
  fadeInUp: "animate-fade-in-up",
  fadeInDown: "animate-fade-in-down",
  
  // Hover effects
  hoverScale: "hover:scale-105 transition-transform duration-300",
  hoverShadow: "hover:shadow-xl transition-shadow duration-300",
  hoverBorder: "hover:border-primary/40 transition-colors duration-300",
  
  // Card animations
  cardHover: "hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
  cardBorderHover: "hover:border-primary/40 transition-colors duration-300",
  
  // Button animations
  buttonHover: "hover:scale-105 active:scale-95 transition-transform duration-200",
  
  // Scroll animations (à utiliser avec Intersection Observer)
  scrollFadeIn: "opacity-0 translate-y-4 transition-all duration-700",
  scrollFadeInActive: "opacity-100 translate-y-0",
  
  // Loading animations
  pulse: "animate-pulse",
  spin: "animate-spin",
  
  // Stagger animations (pour listes)
  stagger: {
    container: "space-y-4",
    item: "opacity-0 animate-fade-in-up",
  },
};

// Délais pour les animations stagger
export const staggerDelays = {
  item1: "animation-delay-100",
  item2: "animation-delay-200",
  item3: "animation-delay-300",
  item4: "animation-delay-400",
  item5: "animation-delay-500",
};

// Durées d'animation
export const durations = {
  fast: "duration-150",
  normal: "duration-300",
  slow: "duration-500",
  slower: "duration-700",
};

// Easings
export const easings = {
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  bounce: "ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]",
};

// Intersection Observer hook pour scroll animations
export const useScrollAnimation = () => {
  if (typeof window === 'undefined') return null;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animations.scrollFadeInActive);
          entry.target.classList.remove(animations.scrollFadeIn);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }
  );
  
  return observer;
};

// Classes CSS personnalisées à ajouter dans globals.css
export const customAnimationCSS = `
/* Fade in animations */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

.animate-fade-in-down {
  animation: fade-in-down 0.6s ease-out;
}

/* Animation delays for stagger effect */
.animation-delay-100 {
  animation-delay: 100ms;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

.animation-delay-500 {
  animation-delay: 500ms;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  html {
    scroll-behavior: auto;
  }
}
`;

// Responsive breakpoints (Tailwind defaults)
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
};

// Helper pour vérifier le breakpoint actuel
export const getCurrentBreakpoint = (): string => {
  if (typeof window === 'undefined') return 'xl';
  
  const width = window.innerWidth;
  
  if (width < 640) return 'xs';
  if (width < 768) return 'sm';
  if (width < 1024) return 'md';
  if (width < 1280) return 'lg';
  if (width < 1536) return 'xl';
  return '2xl';
};

// Classes responsive utiles
export const responsiveClasses = {
  // Containers
  container: "container mx-auto px-4 sm:px-6 lg:px-8",
  
  // Grilles
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-6",
  grid3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  grid4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
  
  // Textes
  h1: "text-3xl sm:text-4xl lg:text-5xl font-bold",
  h2: "text-2xl sm:text-3xl lg:text-4xl font-bold",
  h3: "text-xl sm:text-2xl lg:text-3xl font-bold",
  body: "text-sm sm:text-base",
  bodyLg: "text-base sm:text-lg",
  
  // Espacements
  sectionPy: "py-12 sm:py-16 lg:py-20",
  cardP: "p-4 sm:p-6 lg:p-8",
  
  // Flex
  flexCol: "flex flex-col",
  flexRow: "flex flex-col sm:flex-row",
  flexCenter: "flex items-center justify-center",
  
  // Gaps
  gap: "gap-4 sm:gap-6 lg:gap-8",
};

