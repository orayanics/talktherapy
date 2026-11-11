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

export type Session = { user: UserResponse } | null

export async function fetchSession(signal?: AbortSignal): Promise<Session> {
  if (typeof window === 'undefined')
    throw new Error('Session checks require a browser')
  try {
    const { data } = await api<{ data: UserResource }>('/api/v1/me', { signal })
    return { user: toUser(data) }
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 401) throw error
    return null
  }
}

export async function mutateSignOut() {
  await initializeCsrf()
  await api('/logout', { method: 'POST' })
}
