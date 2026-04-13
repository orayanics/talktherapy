import type { USER_ROLE } from '@/types/account'

export interface UserResponse {
  id: string
  createdAt: string
  updatedAt: string

  email: string
  emailVerified: boolean
  name: string
  image?: string | null | undefined // never undefined at your app boundary
  banned: boolean | null | undefined // never undefined at your app boundary

  role: USER_ROLE
  banReason: string | null | undefined
  banExpires: Date | null | undefined
}

export interface SessionResponse {
  expiresAt: string
  token: string
  createdAt: string
  updatedAt: string
  ipAddress: string
  userAgent: string
  userId: string
  impersonatedBy: string | null
  id: string
}
