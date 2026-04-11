import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

// export const { signIn, signUp, useSession } = createAuthClient()
export const authClient = createAuthClient({
  baseURL: 'http://localhost:8000', // The base URL of your auth server
  basePath: '/auth/api', // The base path for auth-related API endpoints
  plugins: [adminClient()],
})
