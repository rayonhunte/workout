import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

// Determine app version at build time.
// Prefer APP_VERSION env (set by CI), fall back to package.json version.
// eslint-disable-next-line no-undef
let appVersion = process.env.APP_VERSION
try {
  if (!appVersion) {
    const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))
    appVersion = pkg.version
  }
} catch {
  appVersion = '0.0.0'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
})
