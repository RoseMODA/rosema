import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: "index.html",
        pos: "public/pos/pos.html",
        mujer: "public/categories/mujer.html",
        hombre: "public/categories/hombre.html",
        ninos: "public/categories/ninos.html",
        otros: "public/categories/otros.html",
        product: "product.html",
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    open: false,
  },
  publicDir: "public",
});
