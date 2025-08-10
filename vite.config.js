import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        // Páginas principales
        main: resolve(__dirname, "src/pages/index.html"),
        product: resolve(__dirname, "src/pages/product.html"),
        pos: resolve(__dirname, "src/pages/pos.html"),

        // Categorías
        mujer: resolve(__dirname, "src/pages/categories/mujer.html"),
        hombre: resolve(__dirname, "src/pages/categories/hombre.html"),
        ninos: resolve(__dirname, "src/pages/categories/ninos.html"),
        otros: resolve(__dirname, "src/pages/categories/otros.html"),
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
