import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Shared self-signed cert lives at the monorepo root (talktherapy/certs/).
// Generate once with: openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem
const certDir = resolve(__dirname, '../certs')

export default defineConfig({
  server: {
    port: 3000,
    host: true, // bind 0.0.0.0 so the LAN IP works
    https: {
      key: readFileSync(resolve(certDir, 'key.pem')),
      cert: readFileSync(resolve(certDir, 'cert.pem')),
    },
    hmr: {
      clientPort: 3000,
    },
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart(),
    viteReact(),
  ],
  optimizeDeps: {
    // exclude: ["react-markdown"],
  },
})
