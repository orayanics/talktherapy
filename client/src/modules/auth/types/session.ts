import type { USER_ROLE } from '#/types/account'

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
