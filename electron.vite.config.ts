import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src/renderer/src'),
        '@shared': resolve(__dirname, './src/shared')
      }
    },
    server: {
      proxy: {
        '/pokeos': {
          target: 'https://api.pokeos.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/pokeos/, '')
        }
      }
    }
  }
})
