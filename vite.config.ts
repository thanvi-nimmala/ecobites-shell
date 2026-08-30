import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this at /ecobites-shell/, so the built asset URLs need that
// prefix — but the dev server stays at the root, or the launch config breaks.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/ecobites-shell/' : '/',
  server: { port: 5184 },
}))
