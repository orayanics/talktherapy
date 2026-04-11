import type { USER_ROLE } from '@/types/account'

export interface UserResponse {
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
  role: USER_ROLE
  banned: boolean
  banReason: string | null
  banExpires: string | null
  id: string
  status: string
  diagnosis?: string
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
