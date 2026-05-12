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
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
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
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-inter)', 'Inter', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '600' }],
        'headline-lg': ['30px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '500' }],
        'headline-md': ['20px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '500' }],
        'body-base': ['14px', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '400' }],
        'label-caps': ['11px', { lineHeight: '1', letterSpacing: '0.1em', fontWeight: '600' }],
        'mono-data': ['13px', { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '500' }],
      },
      spacing: {
        'gutter': '24px',
        'container-margin': '48px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 2px)',
        badge: '2px',
      },
      boxShadow: {
        float: '0 20px 40px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
