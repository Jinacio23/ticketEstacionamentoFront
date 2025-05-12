import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // Abre automaticamente o navegador
    proxy: {
      // Configuração de proxy para o backend, se necessário
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      // Adicione aliases para facilitar importações, se desejar
      "@": "/src",
    },
  },
});
