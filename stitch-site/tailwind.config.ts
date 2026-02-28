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
                // Premium Indigo/Violet Palette
                primary: {
                    DEFAULT: '#6366f1', // Indigo 500
                    hover: '#818cf8',   // Indigo 400
                    glow: 'rgba(99, 102, 241, 0.35)',
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                },
                accent: {
                    DEFAULT: '#a78bfa', // Violet 400
                    hover: '#c4b5fd',
                    glow: 'rgba(167, 139, 250, 0.3)',
                },
                secondary: {
                    DEFAULT: '#fafafa',
                    hover: '#e4e4e7',
                    silver: '#a1a1aa',
                },
                surface: {
                    0: '#09090b',  // Zinc 950
                    1: '#18181b',  // Zinc 900
                    2: '#27272a',  // Zinc 800
                    3: '#3f3f46',  // Zinc 700
                },
                success: {
                    DEFAULT: '#34d399',
                    glow: 'rgba(52, 211, 153, 0.3)',
                },
                gold: '#eab308', // Added for V2 Pricing
                'card-dark': '#16161a', // Added for V2 Pricing
            },
            fontFamily: {
                sans: ['var(--font-jakarta)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
                display: ['var(--font-jakarta)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-jetbrains)', 'monospace'],
            },
            boxShadow: {
                'glow-sm': '0 0 20px -5px rgba(99, 102, 241, 0.15)',
                'glow-md': '0 0 40px -10px rgba(99, 102, 241, 0.2)',
                'glow-lg': '0 0 60px -15px rgba(99, 102, 241, 0.25)',
                'glow-accent': '0 0 40px -10px rgba(167, 139, 250, 0.2)',
                'card': '0 0 0 1px rgba(255, 255, 255, 0.04), 0 2px 8px rgba(0, 0, 0, 0.4), 0 16px 48px rgba(0, 0, 0, 0.6)',
                'card-hover': '0 0 0 1px rgba(99, 102, 241, 0.15), 0 4px 16px rgba(0, 0, 0, 0.5), 0 24px 64px rgba(0, 0, 0, 0.7)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
                'spin-slow': 'spin 20s linear infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'orbit': 'orbit 30s linear infinite',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                orbit: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                glowPulse: {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '0.8' },
                },
            },
            borderRadius: {
                '4xl': '2rem',
            },
        },
    },
    plugins: [],
} satisfies Config;
