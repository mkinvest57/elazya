import type { Config } from "tailwindcss";

export default {
    darkMode: ['selector', '[data-theme="dark"]'],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Luxury Digital Twin Palette
                primary: {
                    DEFAULT: '#00ffa3', // Neon Mint
                    hover: '#00e08f',
                    glow: 'rgba(0, 255, 163, 0.4)',
                    laser: '#7affcf',
                },
                secondary: {
                    DEFAULT: '#ffffff', // Pure White for luxury
                    hover: '#e5e5e5',
                    silver: '#94a3b8',
                },
                surface: {
                    0: '#000000', // Absolute Black
                    1: '#0a0a0a', // Deep Obsidian
                    2: '#121212', // Dark Grey
                    3: '#1a1a1a', // Edge
                },
            },
            fontFamily: {
                sans: ['var(--font-outfit)', 'var(--font-inter)', 'sans-serif'],
                display: ['var(--font-outfit)', 'sans-serif'],
                mono: ['var(--font-jetbrains)', 'monospace'],
            },
            boxShadow: {
                'luxury-glow': '0 0 50px -12px rgba(0, 255, 163, 0.2)',
                'luxury-card': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 20px 50px rgba(0, 0, 0, 1)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 8s ease-in-out infinite',
                'scan': 'scan 3s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0) rotate(0)' },
                    '50%': { transform: 'translateY(-20px) rotate(1deg)' },
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                }
            }
        },
    },
    plugins: [],
} satisfies Config;
