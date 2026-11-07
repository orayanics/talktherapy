import type { ReactNode } from 'react'
import { Navigate } from '@tanstack/react-router'
import { authClient } from '../api/auth-client'
import { SessionProvider } from '../context/SessionContext'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'

export default function SessionBoundary({ children }: { children: ReactNode }) {
  const { data, isPending, isError, refetch } = authClient.useSession()
  if (isPending) return <StateLoading fullpage />
  if (isError)
    return (
      <StateError
        onRetry={() => {
          void refetch()
        }}
      />
    )
  if (!data) return <Navigate to="/login" />
  return <SessionProvider value={data.user}>{children}</SessionProvider>
}
