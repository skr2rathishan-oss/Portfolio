import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 5173,
    // HMR can be disabled via DISABLE_HMR=true (e.g. while agents edit files).
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
