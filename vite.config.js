import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    target: "esnext",
    rollupOptions: {
      external: [], // Include all deps
    },
  },
  ssr: {
    noExternal: true, // Bundle server-side for API
  },
});
