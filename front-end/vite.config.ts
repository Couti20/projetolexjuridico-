import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;

            if (id.includes('recharts') || id.includes('/d3-')) {
              return 'vendor-charts';
            }

            if (id.includes('motion')) {
              return 'vendor-motion';
            }

            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }

            if (
              id.includes('react-router-dom')
              || id.includes('@remix-run')
              || id.includes('react')
              || id.includes('scheduler')
            ) {
              return 'vendor-react';
            }

            return undefined;
          },
        },
      },
    },
  };
});
