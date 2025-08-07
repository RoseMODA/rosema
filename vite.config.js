import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'public/index.html',
        pos: 'public/pos.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  publicDir: 'public'
});
