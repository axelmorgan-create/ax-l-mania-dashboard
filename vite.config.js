import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5173,
    proxy: {
      "/api/foleybot": {
        target: "http://localhost:8787",
        changeOrigin: true,
        rewrite: () => "/chat"
      }
    }
  }
});
