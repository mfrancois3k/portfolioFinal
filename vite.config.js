import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // root: './',
  // base: './',
  css: {
    preprocessorOptions: {
      scss: {
      
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})
