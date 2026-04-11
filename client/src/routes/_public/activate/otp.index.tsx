import { createFileRoute } from '@tanstack/react-router'
import FormOtp from '@/modules/activation/FormOtp'

export const Route = createFileRoute('/_public/activate/otp/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <FormOtp />
    </div>
  )
}
