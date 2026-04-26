/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  safelist: [
    // Mode backgrounds
    'bg-slate-50', 'bg-violet-50', 'bg-amber-50', 'bg-teal-50', 'bg-green-50',
    // Mode panels
    'bg-white', 'bg-violet-100', 'bg-amber-100', 'bg-teal-100', 'bg-green-100',
    // Mode borders
    'border-slate-200', 'border-violet-200', 'border-amber-200', 'border-teal-200', 'border-green-200',
    // Mode text
    'text-slate-900', 'text-violet-900', 'text-amber-900', 'text-teal-900', 'text-green-900',
    // Accent lights
    'bg-indigo-50', 'bg-violet-100', 'bg-amber-100', 'bg-teal-100', 'bg-green-100',
    // Accent text
    'text-indigo-700', 'text-violet-700', 'text-amber-800', 'text-teal-700', 'text-green-700',
    // Accent bg
    'bg-indigo-500', 'bg-violet-500', 'bg-amber-500', 'bg-teal-500', 'bg-green-500',
    // Hover accents
    'hover:bg-indigo-600', 'hover:bg-violet-600', 'hover:bg-amber-600', 'hover:bg-teal-600', 'hover:bg-green-600',
    // Button outlines
    'border-indigo-300', 'border-violet-300', 'border-amber-300', 'border-teal-300', 'border-green-300',
    'hover:bg-indigo-50', 'hover:bg-violet-50', 'hover:bg-amber-50', 'hover:bg-teal-50', 'hover:bg-green-50',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      transitionDuration: {
        700: '700ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
