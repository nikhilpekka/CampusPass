import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forwards frontend API calls to the backend during local dev
      "/api": "http://localhost:5000",
    },
  },
});
