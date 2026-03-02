// ~/lib/auth-guards.ts
import { redirect } from '@tanstack/react-router'
import type { UserResponse } from '~/models/system'

export type AccountRole = UserResponse['account_role']

/**
 * sudo bypasses all role checks.
 */
export function hasRole(
  user: UserResponse,
  ...allowedRoles: Array<AccountRole>
): boolean {
  if (user.account_role === 'sudo') return true
  return allowedRoles.includes(user.account_role)
}

export function hasPermission(user: UserResponse, permission: string): boolean {
  if (user.account_role === 'sudo') return true
  return user.account_permissions?.includes(permission) ?? false
}

export function hasAllPermissions(
  user: UserResponse,
  permissions: Array<string>,
): boolean {
  if (user.account_role === 'sudo') return true
  return permissions.every((p) => user.account_permissions?.includes(p))
}

export function hasAnyPermission(
  user: UserResponse,
  permissions: Array<string>,
): boolean {
  if (user.account_role === 'sudo') return true
  return permissions.some((p) => user.account_permissions?.includes(p))
}

/**
 * Call inside a route loader. Throws a redirect to /unauthorized if the check fails.
 * Returns the user for convenience (avoids re-fetching).
 */
// Example: requireRole(session, 'admin') - only allows admins
// Example: requireRole(session, 'admin', 'clinician') - allows admins and clinicians
export function requireRole(
  user: UserResponse,
  ...allowedRoles: Array<AccountRole>
): UserResponse {
  if (!hasRole(user, ...allowedRoles)) {
    throw redirect({ to: '/unauthorized' })
  }
  return user
}

export function requirePermission(
  user: UserResponse,
  permission: string,
): UserResponse {
  if (!hasPermission(user, permission)) {
    throw redirect({ to: '/unauthorized' })
  }
  return user
}

export function requireAllPermissions(
  user: UserResponse,
  permissions: Array<string>,
): UserResponse {
  if (!hasAllPermissions(user, permissions)) {
    throw redirect({ to: '/unauthorized' })
  }
  return user
}

export function requireAnyPermission(
  user: UserResponse,
  permissions: Array<string>,
): UserResponse {
  if (!hasAnyPermission(user, permissions)) {
    throw redirect({ to: '/unauthorized' })
  }
  return user
}
