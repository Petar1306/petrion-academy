import { resolve } from 'path';
import { defineConfig } from 'vite';

// Multi-page app: every HTML file at the project root is a separate entry point.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        courses: resolve(__dirname, 'courses.html'),
        course: resolve(__dirname, 'course.html'),
        teachers: resolve(__dirname, 'teachers.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
