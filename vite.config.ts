import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['ui.dada-tuda.ru', 'tg-miniapp-dada-b1.dada-tuda.ru'],
}
})