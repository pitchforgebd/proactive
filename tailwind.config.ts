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
      // Colours resolve through the `--*-rgb` CHANNEL variables, not the ready-
      // made `--ink` / `--cyan` colours. With a bare `var(--x)` Tailwind cannot
      // inject an alpha channel, so every `text-onband/55`, `bg-cyan/10`,
      // `border-ink/10` in the codebase silently compiled to nothing. The
      // `<alpha-value>` placeholder is what makes those utilities real.
      colors: {
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        'ink-2': 'rgb(var(--ink-2-rgb) / <alpha-value>)',
        // Always-dark section grounds + the text that sits on them. These do
        // NOT flip with the theme — an ink band stays an ink band in dark mode.
        band: 'rgb(var(--band-rgb) / <alpha-value>)',
        'band-2': 'rgb(var(--band-2-rgb) / <alpha-value>)',
        onband: 'rgb(var(--onband-rgb) / <alpha-value>)',
        paper: 'rgb(var(--paper-rgb) / <alpha-value>)',
        'paper-2': 'rgb(var(--paper-2-rgb) / <alpha-value>)',
        graphite: 'rgb(var(--graphite-rgb) / <alpha-value>)',
        cyan: 'rgb(var(--cyan-rgb) / <alpha-value>)',
        magenta: 'rgb(var(--magenta-rgb) / <alpha-value>)',
        yellow: 'rgb(var(--yellow-rgb) / <alpha-value>)',
        // Already an rgba() hairline — no alpha modifier is used on it.
        line: 'var(--line)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      // Explicit scale — 12/14/16/20/28/40/56/72 (normal letter-spacing).
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.875rem', { lineHeight: '1.35rem' }],
        base: ['1rem', { lineHeight: '1.65rem' }],
        lg: ['1.25rem', { lineHeight: '1.9rem' }],
        xl: ['1.75rem', { lineHeight: '2.1rem' }],
        '2xl': ['2.5rem', { lineHeight: '2.75rem' }],
        '3xl': ['3.5rem', { lineHeight: '3.6rem' }],
        '4xl': ['4.5rem', { lineHeight: '4.5rem' }],
      },
      maxWidth: {
        container: '84rem',
        prose: '68ch',
      },
      borderRadius: {
        none: '0',
        // Softer UI corners — buttons, inputs, chips use `rounded-sm`.
        sm: '0.625rem', // 10px
        DEFAULT: '0.75rem', // 12px
        md: '0.875rem', // 14px
        lg: '1rem', // 16px — cards / panels
        xl: '1.25rem',
        '2xl': '1.5rem',
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
