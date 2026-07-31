import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT || '5173'),
    proxy: {
      '/cwa-api': {
        target: 'https://opendata.cwa.gov.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cwa-api/, ''),
      },
    },
  },
})
