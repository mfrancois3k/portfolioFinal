import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    cssCodeSplit: false
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/scss/abstracts/_variables.scss";`
      }
    }
  }
})
