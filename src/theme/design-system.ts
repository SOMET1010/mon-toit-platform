/**
 * Design System - Centralized Design Tokens
 * 
 * This file defines all design tokens used across the application
 * to ensure visual consistency and maintainability.
 */

// Spacing Scale (4px base unit)
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
} as const;

// Typography Scale
export const typography = {
  h1: {
    size: 'text-4xl md:text-5xl lg:text-6xl',
    weight: 'font-bold',
    lineHeight: 'leading-tight',
  },
  h2: {
    size: 'text-3xl md:text-4xl lg:text-5xl',
    weight: 'font-bold',
    lineHeight: 'leading-tight',
  },
  h3: {
    size: 'text-2xl md:text-3xl lg:text-4xl',
    weight: 'font-semibold',
    lineHeight: 'leading-snug',
  },
  h4: {
    size: 'text-xl md:text-2xl',
    weight: 'font-semibold',
    lineHeight: 'leading-snug',
  },
  body: {
    size: 'text-base',
    weight: 'font-normal',
    lineHeight: 'leading-relaxed',
  },
  small: {
    size: 'text-sm',
    weight: 'font-normal',
    lineHeight: 'leading-normal',
  },
  caption: {
    size: 'text-xs',
    weight: 'font-medium',
    lineHeight: 'leading-normal',
  },
} as const;

// Border Radius
export const radius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  inner: 'shadow-inner',
  none: 'shadow-none',
} as const;

// Transitions
export const transitions = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-300 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
} as const;

// Z-Index Scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Animation Utilities
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  slideInRight: 'animate-slide-in-right',
  slideOutRight: 'animate-slide-out-right',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
} as const;

// Breakpoints (for reference, use with Tailwind's responsive prefixes)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Common Component Patterns
export const patterns = {
  card: {
    base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    hover: 'hover:shadow-md transition-shadow duration-300',
    interactive: 'cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300',
  },
  input: {
    base: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    disabled: 'disabled:cursor-not-allowed disabled:opacity-50',
  },
  button: {
    base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    disabled: 'disabled:pointer-events-none disabled:opacity-50',
  },
} as const;

// Loading States
export const loadingStates = {
  spinner: 'animate-spin rounded-full border-b-2 border-primary',
  pulse: 'animate-pulse rounded-md bg-muted',
  skeleton: 'animate-pulse rounded-md bg-muted/50',
} as const;

// Feedback Colors (using semantic tokens)
export const feedback = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-destructive',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
} as const;

// Helper function to combine classes
export const combineClasses = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};
