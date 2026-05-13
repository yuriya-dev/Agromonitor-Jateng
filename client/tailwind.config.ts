import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        surface: "#F0F0F0",
        foreground: "#000000",
        "accent-red": "#D32F2F",
        "accent-green": "#00E676",
        "accent-grey": "#9E9E9E",
        "border-color": "#000000",
      },
      fontFamily: {
        sans: ['var(--font-rajdhani)'],
        mono: ['var(--font-space-mono)'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        ticker: 'ticker 30s linear infinite',
      }
    },
  },
  plugins: [],
};
export default config;
