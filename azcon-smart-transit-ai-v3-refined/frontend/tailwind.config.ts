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
      colors: {
        brand: {
          50: '#eef5ff',
          500: '#4f7cff',
          600: '#365ef6',
          900: '#0f172f'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 18px 80px rgba(79,124,255,0.18)'
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at top, rgba(79,124,255,0.22), transparent 30%), linear-gradient(180deg, #081223 0%, #060b16 100%)'
      }
    }
  },
  plugins: []
};

export default config;
