/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                surface: '#ffffff',
                primary: '#4f46e5', // "Electric Indigo"
                secondary: '#ec4899', // "Neon Pink"
                'glass-bg': 'rgba(255, 255, 255, 0.05)',
                'glass-border': 'rgba(255, 255, 255, 0.1)',
                'accent-purple': '#8b5cf6',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            borderRadius: {
                'xl': '20px',
                'full': '9999px',
            },
            boxShadow: {
                'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
                'glow-primary': '0 4px 15px rgba(79, 70, 229, 0.4)',
                'glow-primary-hover': '0 8px 25px rgba(236, 72, 153, 0.5)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(45deg, #4f46e5, #ec4899)',
            },
            animation: {
                'float': 'float 20s infinite alternate',
            },
            keyframes: {
                float: {
                    '0%': { transform: 'translate(0, 0) scale(1)' },
                    '100%': { transform: 'translate(50px, 50px) scale(1.1)' },
                }
            }
        },
    },
    plugins: [],
}
