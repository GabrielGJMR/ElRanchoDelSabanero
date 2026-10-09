import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En desarrollo, las llamadas a /api se envían al backend de Spring Boot.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': 'http://localhost:8080' },
  },
})
