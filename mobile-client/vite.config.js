import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 移动端用 5173，PC端可以改成 5174 防止冲突
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端地址
        changeOrigin: true,
      }
    }
  }
})