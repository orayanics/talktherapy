import type { USER_ROLE } from '@/types/account'
import { useSession } from '@/context/SessionContext'
import { hasRole } from '@/utils/auth-guard'

export function useAuthGuard() {
  const session = useSession()
  return {
    role: session.role,
    is: (...roles: Array<USER_ROLE>) => hasRole(session, ...roles),
  }
}
