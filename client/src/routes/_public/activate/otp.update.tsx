import { createFileRoute, useSearch } from '@tanstack/react-router'
import { z } from 'zod'

import FormOtpUpdate from '@/modules/activation/FormOtpUpdate'

export const Route = createFileRoute('/_public/activate/otp/update')({
  validateSearch: z.object({
    otp: z.coerce.string(),
    role: z.enum(['CLINICIAN', 'ADMIN']).optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { otp, role } = useSearch({
    from: '/_public/activate/otp/update',
  })

  if (!otp) return null
  return (
    <div>
      <FormOtpUpdate otp={otp} role={role} />
    </div>
  )
}
