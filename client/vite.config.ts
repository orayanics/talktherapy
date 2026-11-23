import { defineConfig, loadEnv } from 'vite'
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

const config = defineConfig(({ mode }) => {
  const { VITE_PUBLIC_ORIGIN: origin } = loadEnv(
    mode,
    process.cwd(),
    'VITE_PUBLIC_',
  )
  const url = origin && URL.canParse(origin) ? new URL(origin) : null
  if (
    origin &&
    (url?.protocol !== 'https:' ||
      ![url.origin, `${url.origin}/`].includes(origin))
  ) {
    throw new Error(
      'Set VITE_PUBLIC_ORIGIN to the preferred HTTPS origin, such as https://www.example.com, without credentials, a path, query, or fragment.',
    )
  }

  return {
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart({
        // Use a separate route for the shell so it does not replace the homepage.
        spa: { enabled: true, maskPath: '/login' },
        prerender: {
          enabled: true,
          autoStaticPathsDiscovery: false,
          crawlLinks: false,
        },
        pages: [{ path: '/' }],
      }),
      viteReact(),
    ],
    server: {
      port: 3000,
      host: true,
      https,
    },
  }
})

export default config
