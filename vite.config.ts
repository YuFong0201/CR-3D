import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 確保部署至 GitHub Pages 子路徑時所有 JS/CSS 資源正常載入
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          vendor: ['react', 'react-dom', 'zustand', 'lucide-react', 'clsx'],
        },
      },
    },
  },
});
