import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { api, initializeCsrf } from '#/lib/api/client'
import type { UserResponse } from '#/modules/auth/types/session'

interface UserResource {
  id: string
  name: string
  email: string
  email_verified_at: string | null
  role: UserResponse['role']
  status: 'pending' | 'active' | 'suspended'
  image: string | null
  created_at: string
  updated_at: string
}

export const toUser = (user: UserResource): UserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: Boolean(user.email_verified_at),
  role: user.role,
  image: user.image,
  banned: user.status === 'suspended',
  banReason: null,
  banExpires: null,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
})

export const authClient = {
  useSession: () =>
    useQuery({
      queryKey: ['session'],
      retry: false,
      queryFn: async () => {
        try {
          const { data } = await api<{ data: UserResource }>('/api/v1/me')
          return { user: toUser(data) }
        } catch (error) {
          if (
            isAxiosError(error) &&
            [401, 403].includes(error.response?.status ?? 0)
          )
            return null
          throw error
        }
      },
    }),
  signOut: async (options?: { fetchOptions?: { onSuccess?: () => void } }) => {
    await initializeCsrf()
    await api('/logout', { method: 'POST' })
    options?.fetchOptions?.onSuccess?.()
  },
}
