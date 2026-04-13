import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { API_URL } from '@/constants/application'

export const authClient = createAuthClient({
  baseURL: `${API_URL ?? 'https://0.0.0.0:8080'}`,
  basePath: '/auth/api',
  plugins: [adminClient()],
})
