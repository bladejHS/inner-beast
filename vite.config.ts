import { defineConfig } from 'vite';

// Served from https://bladejhs.github.io/inner-beast/
export default defineConfig({
  base: '/inner-beast/',
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
});
