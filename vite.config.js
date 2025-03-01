import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/',  // This ensures proper path resolution
  build: {
    outDir: '.', // Build to root instead of dist
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})
