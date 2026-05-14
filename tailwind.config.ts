import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          soft: 'hsl(var(--destructive-soft))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          soft: 'hsl(var(--success-soft))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'headline-lg': ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-base': ['14px', { lineHeight: '1.55', letterSpacing: '0em', fontWeight: '400' }],
        'label-caps': ['11px', { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '500' }],
        'mono-data': ['13px', { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '500' }],
      },
      spacing: {
        'gutter': '24px',
        'container-margin': '48px',
      },
      borderRadius: {
        // 6px para cards/contenedores, 4px para inputs/botones/badges
        lg: 'var(--radius)',                  /* 6px */
        md: 'calc(var(--radius) - 2px)',      /* 4px */
        sm: 'calc(var(--radius) - 2px)',      /* 4px */
        badge: 'calc(var(--radius) - 2px)',   /* 4px */
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)',
        float: '0 20px 40px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
