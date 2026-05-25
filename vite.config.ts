import { defineConfig } from 'vite'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import vue from '@vitejs/plugin-vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import tailwindcss from '@tailwindcss/vite'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import path from 'node:path'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pkg from './package.json'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer/src')
    }
  }
})
