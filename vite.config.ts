import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          signup: path.resolve(__dirname, 'signup.html'),
          forgotPassword: path.resolve(__dirname, 'forgot-password.html'),
          resetPassword: path.resolve(__dirname, 'reset-password.html'),
          dashboard: path.resolve(__dirname, 'dashboard.html'),
          profile: path.resolve(__dirname, 'profile.html'),
          adminLogin: path.resolve(__dirname, 'admin-login.html'),
          adminPanel: path.resolve(__dirname, 'admin-panel.html'),
          notFound: path.resolve(__dirname, '404.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
