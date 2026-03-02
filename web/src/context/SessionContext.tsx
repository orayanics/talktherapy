import { createContext, useContext } from 'react'
import type { SessionContextValue } from '~/models/system'

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
  children: React.ReactNode
  value: SessionContextValue
}) => {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
