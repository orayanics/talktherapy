import { createFileRoute } from '@tanstack/react-router'
import LoginForm from '#/modules/login/components/LoginForm'

export const Route = createFileRoute('/_public/login')({
  component: LoginRoute,
})

function LoginRoute() {
  return (
    <div className="min-h-screen h-100">
      <div className="grid grid-cols-6 h-full relative">
        <div
          className="z-1
          col-span-6 md:col-span-3 
          bg-white w-100 md:w-full mx-auto
          md:rounded-r-3xl rounded-r-lg md:rounded-none rounded-xl md:m-0 m-6
          flex items-center justify-center
          "
        >
          <LoginForm />
        </div>

        <div className="hidden md:block col-span-3"></div>
      </div>
    </div>
  )
}
