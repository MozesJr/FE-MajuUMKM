import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8060, // UBAH ke 8060
    host: "0.0.0.0", // penting untuk docker
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001", // Kalau backend nanti di 8061, ini juga harus diubah
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
