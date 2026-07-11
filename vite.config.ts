import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'serve' || process.env.VERCEL ? '/' : '/uk-epc-auditor/',
  plugins: [react()],
}))