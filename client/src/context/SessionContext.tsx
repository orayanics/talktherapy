import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { UserResponse } from '@/api/session'

export interface SessionContextValue extends UserResponse {}

export const SessionContext = createContext<SessionContextValue | null>(null)

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export const SessionProvider = ({
  children,
  value,
}: {
  children: ReactNode
  value: SessionContextValue
}) => {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
