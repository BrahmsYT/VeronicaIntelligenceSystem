import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        brand: {
          50: '#eef5ff',
          500: '#4f7cff',
          600: '#365ef6',
          900: '#0f172f'
        },
        app: {
          bg: 'var(--bg)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          surface: 'var(--surface)',
          border: 'var(--border)'
        }
      },
      boxShadow: {
        soft: '0 1px 0 rgba(255,255,255,0.04), 0 10px 28px rgba(2,6,23,0.26)',
        elevated: '0 1px 0 rgba(255,255,255,0.06), 0 18px 42px rgba(2,6,23,0.34)',
        floating: '0 1px 0 rgba(255,255,255,0.08), 0 26px 60px rgba(2,6,23,0.42)',
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 18px 80px rgba(79,124,255,0.18)'
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.05rem',
        '3xl': '1.35rem'
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at top, rgba(79,124,255,0.22), transparent 30%), linear-gradient(180deg, #081223 0%, #060b16 100%)'
      }
    }
  },
  plugins: []
};

export default config;
