// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',   // your source lives in /src
    './app/**/*.{js,ts,jsx,tsx,mdx}',   // (optional) if you also use /app at root
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // (optional)
    './components/**/*.{js,ts,jsx,tsx,mdx}', // (optional)
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config