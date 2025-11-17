// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import Pages from 'vite-plugin-pages'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    Pages({
      dirs: 'src/pages', // default
      extensions: ['jsx', 'tsx'], // include only these
    }),
    ViteImageOptimizer({}),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
});
