import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'vet-primary': '#06b6d4',
        'vet-secondary': '#0891b2',
      }
    },
  },
  plugins: [],
} satisfies Config