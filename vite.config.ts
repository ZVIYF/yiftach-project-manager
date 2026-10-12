import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite Configuration for Yiftach Project Manager.
 * Configured for single-page application builds targeting Cloudflare Pages.
 */
export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@types': resolve(__dirname, 'src/types'),
      '@services': resolve(__dirname, 'src/services'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@styles': resolve(__dirname, 'src/styles'),
    },
  },
});

