import { useSession } from '~/context/SessionContext'
import {
  hasRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '~/utils/auth-guard'
import { AccountRole } from '~/utils/auth-guard'

export function useAuthGuard() {
  const session = useSession()

  return {
    role: session.account_role,
    can: (permission: string) => hasPermission(session, permission),
    canAll: (permissions: string[]) => hasAllPermissions(session, permissions),
    canAny: (permissions: string[]) => hasAnyPermission(session, permissions),
    is: (...roles: AccountRole[]) => hasRole(session, ...roles),
  }
}
