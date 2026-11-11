/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f6f4ee',
        card: '#fffdf8',
        ink: { DEFAULT: '#1d2420', soft: '#55605a', faint: '#8a948d' },
        line: '#dfdbcf',
        brand: { DEFAULT: '#14614a', dark: '#0e4838', tint: '#e3f0ea' },
        warn: '#b4561b',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
