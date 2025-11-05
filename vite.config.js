import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // Project root (where index.html is)
  build: {
    outDir: 'dist', // Output folder for production build
  },
  server: {
    port: 5173, // local dev server port
  },
});
