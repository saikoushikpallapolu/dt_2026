import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@wimp/shared": path.resolve(__dirname, "../shared/src/index.ts"),
    },
  },
  server: {
    host: true, // Listen on all network interfaces (for mobile phone access)
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.DEMO_API_TARGET || "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
