/**
 * Authentication / Authorization helpers
 *
 * Exports:
 * - `hasRole(user, ...roles)` — returns true if user role matches any allowed role
 * - `hasPermission(user, permission)` — returns true if user has the named permission
 * - `hasAllPermissions(user, permissions)` — true if user has every permission
 * - `hasAnyPermission(user, permissions)` — true if user has at least one
 * - `require*` helpers — throw a redirect to `/unauthorized` when checks fail
 *
 * Notes:
 * - `UserSession.role` and `account_status` use uppercase values (e.g. 'superadmin', 'ACTIVE').
 * - `UserSession.permissions` is a string[] (non-optional).
 *
 * Examples:
 *
 * // check a single permission in a component
 * if (hasPermission(session, 'content.create')) {
 *   // render create button
 * }
 *
 * // require a permission inside a route loader (throws redirect on failure)
 * export function loader() {
 *   const session = getSessionSomehow()
 *   requirePermission(session, 'content.delete')
 *   return {} // allowed
 * }
 */
import { redirect } from '@tanstack/react-router'
import type { USER_ROLE } from '@/types/account'
import type { UserResponse } from '@/api/session'

/**
 * Call inside a route loader. Throws a redirect to /unauthorized if the check fails.
 * Returns the user for convenience (avoids re-fetching).
 */
// Example: requireRole(session, 'admin') - only allows admins
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
