import type { AccountRole } from '~/models/system'
import { useSession } from '~/context/SessionContext'
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  hasRole,
} from '~/utils/auth-guard'

export function useAuthGuard() {
  const session = useSession()

  return {
    role: session.account_role,
    can: (permission: string) => hasPermission(session, permission),
    canAll: (permissions: Array<string>) =>
      hasAllPermissions(session, permissions),
    canAny: (permissions: Array<string>) =>
      hasAnyPermission(session, permissions),
    is: (...roles: Array<AccountRole>) => hasRole(session, ...roles),
  }
}
