import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireGuest } from '#/modules/auth/lib/session-guard'
import SessionError from '#/modules/auth/components/SessionError'
import StateLoading from '#/components/State/StateLoading'

export const Route = createFileRoute('/_public')({
  ssr: false,
  beforeLoad: requireGuest,
  pendingComponent: StateLoading,
  errorComponent: SessionError,
  component: Outlet,
})
