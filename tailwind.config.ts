import plugin from 'tailwindcss/plugin';

export default {
   content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // <--- Make sure this line is present
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss/compat') // ✅ built-in, no npm package
  ],
};