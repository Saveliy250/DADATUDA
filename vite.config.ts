import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        allowedHosts: ['ui.dada-tuda.ru', 'tg-miniapp-dada-b1.dada-tuda.ru'],
    },
    optimizeDeps: {
        include: ['react/jsx-runtime'],
    },
    build: {
        rollupOptions: {
            external: ['scheduler'],
        },
    },
}) as UserConfig;