import type { Config } from 'tailwindcss';

/**
 * Design tokens live as CSS variables in app/globals.css ("CMYK Precision").
 * Tailwind only maps names onto them so there is a single source of truth.
 */
const config: Config = {
  // `dark:` follows the attribute the no-flash script writes on <html>.
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        // Always-dark section grounds + the text that sits on them. These do
        // NOT flip with the theme — an ink band stays an ink band in dark mode.
        band: 'var(--band)',
        'band-2': 'var(--band-2)',
        onband: 'var(--onband)',
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        graphite: 'var(--graphite)',
        cyan: 'var(--cyan)',
        magenta: 'var(--magenta)',
        yellow: 'var(--yellow)',
        line: 'var(--line)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      // Explicit scale — 12/14/16/20/28/40/56/72 with tracking on display sizes.
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.1rem', letterSpacing: '0.06em' }],
        sm: ['0.875rem', { lineHeight: '1.35rem' }],
        base: ['1rem', { lineHeight: '1.65rem' }],
        lg: ['1.25rem', { lineHeight: '1.9rem' }],
        xl: ['1.75rem', { lineHeight: '2.1rem', letterSpacing: '-0.015em' }],
        '2xl': ['2.5rem', { lineHeight: '2.75rem', letterSpacing: '-0.025em' }],
        '3xl': ['3.5rem', { lineHeight: '3.6rem', letterSpacing: '-0.03em' }],
        '4xl': ['4.5rem', { lineHeight: '4.5rem', letterSpacing: '-0.035em' }],
      },
      maxWidth: {
        container: '84rem',
        prose: '68ch',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
      },
      transitionTimingFunction: {
        press: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'roller-sweep': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },
      animation: {
        marquee: 'marquee 36s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
