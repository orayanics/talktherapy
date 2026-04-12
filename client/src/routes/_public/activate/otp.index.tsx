import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import FormOtp from '@/modules/activation/FormOtp'

export const Route = createFileRoute('/_public/activate/otp/')({
  validateSearch: z.object({
    email: z.string().optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { email } = Route.useSearch()
  return (
    <div>
      <FormOtp initialEmail={email} />
    </div>
  )
}
