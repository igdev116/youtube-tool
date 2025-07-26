import type { Config } from 'tailwindcss';

import colors from './src/lib/tailwind/colors';
import fontSize from './src/lib/tailwind/fontSize';
import lineHeight from './src/lib/tailwind/lineHeight';
import spacing from './src/lib/tailwind/spacing';
import backgroundImage from './src/lib/tailwind/backgroundImage';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    // container: {
    //   center: true,
    //   padding: {
    //     DEFAULT: '24px',
    //     sm: '24px',
    //     lg: '24px',
    //     xl: '24px',
    //     '2xl': '24px',
    //   },
    //   screens: {
    //     '2xl': '1400px',
    //   },
    // },
    fontSize,
    spacing,
    extend: {
      zIndex: {
        header: '999',
      },
      lineHeight,
      colors,
      keyframes: {
        'accordion-down': {
          from: { height: '0px' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0px' },
        },
        blinkStroke: {
          '0%, 100%': { stroke: '#FFCB30' },
          '50%': { stroke: '#FFD966' },
        },
        pulseStroke: {
          '0%, 100%': { strokeWidth: '1.5' },
          '50%': { strokeWidth: '3' },
        },
      },
      backgroundImage,
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'blink-stroke': 'blinkStroke 1.5s infinite ease-in-out',
        'pulse-stroke': 'pulseStroke 1s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar'),
    require('tailwind-scrollbar-hide'),
  ],
};

export default config;
