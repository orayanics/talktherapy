import AuthLayout from '#/modules/auth/components/AuthLayout'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import FormOtp from '#/modules/activation/components/FormOtp'

export const Route = createFileRoute('/_public/activate/otp/')({
  validateSearch: z.object({
    email: z.string().optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { email } = Route.useSearch()
  return (
    <AuthLayout
      title="Activate your account"
      description="Enter the verification code sent to your email to get started."
    >
      <FormOtp initialEmail={email} />
    </AuthLayout>
  )
}
