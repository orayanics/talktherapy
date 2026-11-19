import AuthLayout from '#/modules/auth/components/AuthLayout'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { z } from 'zod'

import FormOtpUpdate from '#/modules/activation/components/FormOtpUpdate'

export const Route = createFileRoute('/_public/activate/otp/update')({
  validateSearch: z.object({
    otp: z.coerce.string(),
    email: z.string().optional(),
    role: z.enum(['superadmin', 'admin', 'clinician', 'patient']).optional(),
    requires_credentials: z.boolean().optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { otp, role, email, requires_credentials } = useSearch({
    from: '/_public/activate/otp/update',
  })
  if (!otp) return null
  return (
    <AuthLayout
      title="Complete your profile"
      description="A few more details, and you’re ready to begin."
    >
      <FormOtpUpdate
        otp={otp}
        role={role}
        requiresCredentials={requires_credentials}
        initialEmail={email}
      />
    </AuthLayout>
  )
}
