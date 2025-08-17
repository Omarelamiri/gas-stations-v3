import plugin from 'tailwindcss/plugin';

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss/compat') // ✅ built-in, no npm package
  ],
};