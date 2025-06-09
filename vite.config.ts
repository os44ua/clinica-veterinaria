/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
      ],
    },
  },
})
*/
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Variables de entorno
  const env = loadEnv(mode, process.cwd(), "");
     
  return {
    plugins: [react()],
    // CSS con Tailwind
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
        ],
      },
    },
    // Ruta básica para GitHub Pages
    base: env.VITE_APP_BASE_URL || '/',
    build: {
      outDir: 'docs',
    }
  };
});


