import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Served from https://ferjoo.github.io/LFP_practica1/
export default defineConfig({
  plugins: [react()],
  base: '/LFP_practica1/',
})
