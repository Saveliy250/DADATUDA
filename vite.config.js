import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react() ],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['ui.dada-tuda.ru', 'dada-tuda.ru', 'tg-miniapp-dada-b1.dada-tuda.ru'],
  },
})
