import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves this project from /campus-submit/, not the domain
  // root, so built asset URLs need that prefix. Local dev keeps a plain "/"
  // so `npm run dev` still serves from http://localhost:5173/.
  base: command === 'build' ? '/campus-submit/' : '/',
}))
