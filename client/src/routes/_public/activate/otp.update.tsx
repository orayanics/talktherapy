import { createFileRoute, useSearch } from '@tanstack/react-router'
import { z } from 'zod'

import FormOtpUpdate from '@/modules/activation/FormOtpUpdate'

export const Route = createFileRoute('/_public/activate/otp/update')({
  validateSearch: z.object({
    otp: z.coerce.string(),
    email: z.string().optional(),
    role: z.enum(['CLINICIAN', 'ADMIN', 'PATIENT']).optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { otp, role, email } = useSearch({
    from: '/_public/activate/otp/update',
  })
  if (!otp) return null
  return <FormOtpUpdate otp={otp} role={role} initialEmail={email} />
}
