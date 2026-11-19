import { createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/modules/auth/lib/auth-guard'
import SlpAssignments from '#/modules/slp/components/SlpAssignments'

export const Route = createFileRoute('/_private/(shared)/slp/assignments')({
  staticData: { crumb: 'SLP assignments', bcLink: '.' },
  beforeLoad: ({ context }) => {
    requireRole(context.user, 'patient', 'clinician')
  },
  component: SlpAssignments,
})
