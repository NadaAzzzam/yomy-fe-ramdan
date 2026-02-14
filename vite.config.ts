import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false,
    hmr: {
      clientPort: 5174,
      overlay: true,
    },
    proxy: {
      '/aladhan-audio': {
        target: 'https://cdn.aladhan.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aladhan-audio/, '/audio'),
      },
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) return 'vendor';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
      treeshake: true,
    },
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true,
    assetsInlineLimit: 1024,
  },
  esbuild: {
    legalComments: 'none',
    drop: ['debugger'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@ionic/react', '@ionic/react-router', 'ionicons'],
  },
});
