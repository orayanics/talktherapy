import { redirect } from '@tanstack/react-router'
import type { USER_ROLE } from '#/modules/auth/types/account'
import type { UserResponse } from '#/modules/auth/types/session'

/**
 * Call inside beforeLoad. Throws a redirect to /unauthorized if the check fails.
 * Returns the user for convenience (avoids re-fetching).
 */
// Superadmins retain the existing role bypass; other users need an allowed role.
// Example: requireRole(session, 'admin', 'clinician') - allows admins and clinicians
export function requireRole(
  user: UserResponse,
  ...allowedRoles: Array<USER_ROLE>
): UserResponse {
  if (!hasRole(user, ...allowedRoles)) {
    throw redirect({ to: '/unauthorized' })
  }
  return user
}

export function hasRole(
  user: UserResponse,
  ...allowedRoles: Array<USER_ROLE>
): boolean {
  if (user.role === 'superadmin') return true
  return allowedRoles.includes(user.role)
}
