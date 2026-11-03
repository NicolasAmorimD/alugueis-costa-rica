import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef7f1',
          100: '#d9ecdf',
          600: '#28734d',
          700: '#205d3e',
          900: '#163d2b',
        },
        sand: '#f8f6f1',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(32, 54, 42, 0.08)',
      },
    },
  },
  plugins: [],
}

export default config
