import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    server: {
        port: 3000,
        host: true,
    },
    build: {
        outDir: 'build',
    },
    plugins: [react()],
});
