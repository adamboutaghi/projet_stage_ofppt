/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"
    
  ],
  theme: {
    extend: {
      animation: {
        'spin-3d': 'spin3d 8s linear infinite',
      },
      keyframes: {
        spin3d: {
          '0%': { 
            transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
            filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))'
          },
          '50%': { 
            transform: 'perspective(1000px) rotateY(180deg) rotateX(0deg)',
          },
          '100%': { 
              transform: 'perspective(1000px) rotateY(360deg) rotateX(0deg)',
            filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))'
          }
        }
      }
    },
  },
  plugins: [],
}

