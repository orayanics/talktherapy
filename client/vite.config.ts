import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import fs from 'node:fs'

const keyPath = '../certs/localhost-key.pem'
const certificatePath = '../certs/localhost.pem'
const https =
  fs.existsSync(keyPath) && fs.existsSync(certificatePath)
    ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certificatePath) }
    : undefined

const config = defineConfig({
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
  server: {
    port: 3000,
    host: true,
    https,
  },
})

export default config
