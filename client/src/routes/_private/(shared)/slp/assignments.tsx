import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthGuard } from '#/modules/auth/hooks/useAuth'
import SlpAssignments from '#/modules/slp/components/SlpAssignments'

export const Route = createFileRoute('/_private/(shared)/slp/assignments')({ component: RouteComponent })
function RouteComponent() { const { is } = useAuthGuard(); if (!(is('patient') || is('clinician'))) return <Navigate to="/unauthorized" />; return <SlpAssignments /> }
