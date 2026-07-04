import { resolve } from 'path';
import { defineConfig } from 'vite';

// Multi-page app: entry points are added here as each HTML page is created.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        register: resolve(__dirname, 'register.html'),
      },
    },
  },
});
