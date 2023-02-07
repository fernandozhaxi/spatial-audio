import { fileURLToPath, URL } from 'node:url'
import copy from 'rollup-plugin-copy'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),copy({
    targets: [
      { src: './multitrack', dest: './client/multitrack' }, //执行拷贝
    ]
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8080,
    open: true,
    cors: true,
    host: true,
    https: false,
    proxy: {
      '/api': {
        target: "http://172.16.8.66:9999",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: './client',
    brotliSize: false,
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      },
    },
  }
})
