// ~/lib/auth-guards.ts
import { redirect } from '@tanstack/react-router'
import type { ACCOUNT_ROLE } from '~/models/account'
import type { SESSION_USER } from '~/models/system'
/**
 * sudo bypasses all role checks.
 */
export function hasRole(
  user: SESSION_USER,
  ...allowedRoles: Array<ACCOUNT_ROLE>
): boolean {
  if (user.account_role === 'sudo') return true
  return allowedRoles.includes(user.account_role)
}

export function hasPermission(user: SESSION_USER, permission: string): boolean {
  if (user.account_role === 'sudo') return true
  if (user.account_status !== 'active') return false
  return user.account_permissions?.includes(permission) ?? false
}

export function hasAllPermissions(
  user: SESSION_USER,
  permissions: Array<string>,
): boolean {
  if (user.account_role === 'sudo') return true
  return permissions.every((p) => user.account_permissions?.includes(p))
}

export function hasAnyPermission(
  user: SESSION_USER,
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
  user: SESSION_USER,
  ...allowedRoles: Array<ACCOUNT_ROLE>
): SESSION_USER {
  if (!hasRole(user, ...allowedRoles)) {
    throw redirect({ to: '/unauthorized' })
  }
  return user
}

export function requirePermission(
  user: SESSION_USER,
  permission: string,
): SESSION_USER {
  if (!hasPermission(user, permission)) {
    throw redirect({ to: '/unauthorized' })
  }
  return user
}

export function requireAllPermissions(
  user: SESSION_USER,
  permissions: Array<string>,
): SESSION_USER {
  if (!hasAllPermissions(user, permissions)) {
    throw redirect({ to: '/unauthorized' })
  }
  return user
}

export function requireAnyPermission(
  user: SESSION_USER,
  permissions: Array<string>,
): SESSION_USER {
  if (!hasAnyPermission(user, permissions)) {
    throw redirect({ to: '/unauthorized' })
  }
  return user
}
