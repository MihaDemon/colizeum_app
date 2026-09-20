import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('../', import.meta.url)), '')
  // Explicit allowlist: never expose the root .env's credentials to the browser.
  const clubName = (process.env.CLUB_NAME ?? env.CLUB_NAME ?? '').trim() || 'Клуб'
  return {
    plugins: [react()],
    base: './',
    define: {
      'import.meta.env.VITE_CLUB_NAME': JSON.stringify(clubName),
    },
  }
})
