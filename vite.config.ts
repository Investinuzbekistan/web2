import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // three.js is only needed by the hero globe, which is loaded on idle and
        // skipped entirely when WebGL is missing or motion is reduced.
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap')) return 'gsap';
          return undefined;
        },
      },
    },
  },
  server: { port: 5172 },
  preview: { port: 5172 },
});
