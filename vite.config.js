import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        -> dist/         (deploy to Vercel)
// `npm run build:single` -> dist-single/  (one self-contained index.html)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist' },
}));
