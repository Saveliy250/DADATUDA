import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['ui.dada-tuda.ru', 'dada-tuda.ru'],
    https: true,
  },
})
