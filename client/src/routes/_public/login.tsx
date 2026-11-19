import AuthLayout from '#/modules/auth/components/AuthLayout'
import { createFileRoute } from '@tanstack/react-router'
import LoginForm from '#/modules/login/components/LoginForm'

export const Route = createFileRoute('/_public/login')({
  component: LoginRoute,
})

function LoginRoute() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Ready to continue where you left off?"
    >
      <LoginForm />
    </AuthLayout>
  )
}
