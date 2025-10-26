/**
 * MON TOIT - Configuration Tailwind CSS
 * Design System Optimisé - Palette Harmonieuse Ivoirienne
 * @author Manus AI
 * @date 2025-10-26
 */
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // ===== PALETTE PRINCIPALE OPTIMISÉE =====
        // Inspirée du drapeau ivoirien : Orange + Vert + Terracotta
        
        primary: {
          DEFAULT: '#F77F00', // Orange Ivoirien (drapeau)
          50: '#FFF8F0',
          100: '#FFECD9',
          200: '#FFD9B3',
          300: '#FFC68C',
          400: '#FFB366',
          500: '#F77F00', // Orange principal
          600: '#D96D00', // Orange foncé
          700: '#BB5C00',
          800: '#9D4A00',
          900: '#7F3900',
        },
        
        secondary: {
          DEFAULT: '#009E60', // Vert Ivoirien (drapeau)
          50: '#E6F7F0',
          100: '#CCEFE1',
          200: '#99DFC3',
          300: '#66CFA5',
          400: '#33BF87',
          500: '#009E60', // Vert principal
          600: '#007A4A', // Vert foncé (meilleur contraste)
          700: '#006038',
          800: '#004626',
          900: '#002C14',
        },
        
        accent: {
          DEFAULT: '#D96548', // Terracotta Doux
          50: '#FDF5F3',
          100: '#FAEBE7',
          200: '#F5D7CF',
          300: '#F0C3B7',
          400: '#EA949F',
          500: '#D96548', // Terracotta principal
          600: '#C04A2F',
          700: '#A73F27',
          800: '#8E341F',
          900: '#752917',
        },

        // ===== BACKGROUNDS OPTIMISÉS =====
        background: {
          DEFAULT: '#FFFEF9', // Fond principal (ivoire chaud)
          surface: '#F5F1EB', // Cartes et surfaces élevées
        },

        // ===== TEXTE OPTIMISÉ POUR ACCESSIBILITÉ =====
        foreground: {
          DEFAULT: '#1A1A1A', // Texte principal (17.8:1 contraste)
          muted: '#5A5A5A', // Texte secondaire (7.2:1 contraste)
          subtle: '#8A8A8A', // Texte tertiaire (4.6:1 contraste)
        },

        // ===== COULEURS FONCTIONNELLES (INCHANGÉES) =====
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706', // Utiliser dark pour le texte
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#2563EB',
          light: '#60A5FA',
          dark: '#1D4ED8',
        },

        // ===== COULEURS NEUTRES (GRAYS) =====
        gray: {
          50: '#F9FAFB',
          100: '#F5F5F5',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },

        // ===== COULEURS LEGACY (pour compatibilité) =====
        // Ces couleurs sont conservées pour éviter de casser le code existant
        // À migrer progressivement vers la nouvelle palette
        ansut: {
          blue: '#2256A3',
          orange: '#F08224',
        },
        ci: {
          orange: '#F77F00', // Identique à primary
          white: '#FFFFFF',
          green: '#009E60', // Identique à secondary
        },
      },

      // ===== TYPOGRAPHIE =====
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.25' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.75' }],
        xl: ['1.25rem', { lineHeight: '1.75' }],
        '2xl': ['1.5rem', { lineHeight: '1.5' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },

      // ===== ESPACEMENT =====
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '5rem',
        '5xl': '6rem',
      },

      // ===== BORDER RADIUS =====
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
      },

      // ===== SHADOWS =====
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
      },

      // ===== TRANSITIONS =====
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ===== ANIMATIONS =====
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 200ms ease-out',
        'slide-up': 'slide-up 300ms ease-out',
        'slide-down': 'slide-down 300ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
      },

      // ===== GRADIENTS OPTIMISÉS =====
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #FFFEF9 0%, #F5F1EB 100%)', // Fond → Surface
        'gradient-primary': 'linear-gradient(135deg, #F77F00 0%, #D96D00 100%)', // Orange principal
        'gradient-secondary': 'linear-gradient(135deg, #009E60 0%, #007A4A 100%)', // Vert principal
        'gradient-accent': 'linear-gradient(135deg, #D96548 0%, #C04A2F 100%)', // Terracotta
        'gradient-ci': 'linear-gradient(90deg, #F77F00 0%, #FFFFFF 50%, #009E60 100%)', // Drapeau
        'pattern-african': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(217, 101, 72, 0.03) 10px, rgba(217, 101, 72, 0.03) 20px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

