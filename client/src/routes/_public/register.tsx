import AuthLayout from '#/modules/auth/components/AuthLayout'
import { createFileRoute } from '@tanstack/react-router'
import RegisterForm from '#/modules/register/components/RegisterForm'

export const Route = createFileRoute('/_public/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthLayout
      title="Create your account"
      description="Your next conversation starts here."
    >
      <RegisterForm />
    </AuthLayout>
  )
}
