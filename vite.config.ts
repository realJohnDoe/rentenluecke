import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The site is served from https://<user>.github.io/rentenluecke/, so production
// assets need the repository name as a base path. `npm run dev` serves from "/".
// Keyed on `mode` rather than `command` so that `vite preview` — which serves the
// production build — resolves assets the same way the deployed site does.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/rentenluecke/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}))
