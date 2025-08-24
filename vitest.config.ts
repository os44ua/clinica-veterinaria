import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],

    coverage: {
      provider: 'v8',

      // Reportes útiles en local y en CI
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',

      // Solo medimos cobertura del código de la app
      include: ['src/**/*.{ts,tsx}'],

      // Excluimos “ruido” que infla el denominador sin aportar calidad
      exclude: [
        // Tests y utilidades de test
        'src/tests/**',
        'src/**/__mocks__/**',

        // Tipos/declaraciones y archivos índice de re-export
        'src/**/*.d.ts',
        'src/**/index.ts',

        // Activos estáticos y diccionarios de i18n (sin lógica ejecutable)
        'src/assets/**',
        'src/i18n/**',

        // Entradas/bootstrapping sin lógica de negocio
        'src/main.tsx',
        'src/App.tsx',

        // Inicialización de SDKs (Firebase) sin lógica propia
        'src/firebase/**',

        // Wrappers finos sobre SDKs y contratos de tipos
        'src/services/**',
        'src/interfaces/**',

        // Proveedor de inyección sin lógica (solo wiring)
        'src/providers/ReduxProvider.tsx',

        // Historias de Storybook (si existieran)
        'src/**/*.stories.{ts,tsx}',

        // Configuración de herramientas
        '**/*.config.{js,ts}',
        'vite.config.ts',
        'vitest.config.ts', // este propio archivo
      ],
    },
  },
})
