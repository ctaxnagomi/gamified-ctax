/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./views/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Space Grotesk', 'sans-serif'],
                doodle: ['Patrick Hand', 'cursive'],
                console: ['VT323', 'monospace'],
                retro: ['"Press Start 2P"', 'cursive'],
            },
            colors: {
                kraken: {
                    primary: '#3b82f6',
                    secondary: '#1e40af',
                    dark: '#0f172a',
                    card: '#1e293b',
                    accent: '#f43f5e',
                    success: '#22c55e',
                    warning: '#eab308',
                }
            },
            animation: {
                'spin-slow': 'spin 20s linear infinite',
                'bounce-visualizer': 'bounce-visualizer 1s infinite ease-in-out',
            },
            keyframes: {
                'bounce-visualizer': {
                    '0%, 100%': { height: '10%' },
                    '50%': { height: '100%' },
                }
            }
        },
    },
    plugins: [],
}
