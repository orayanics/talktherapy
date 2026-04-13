import { createFileRoute } from '@tanstack/react-router'
import LoginForm from '@/modules/login/LoginForm'

export const Route = createFileRoute('/_public/login')({
  component: LoginRoute,
})

const TEMP_IMAGE_URL =
  'https://images.unsplash.com/photo-1650611250959-1e823abf6841?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

function LoginRoute() {
  return (
    <div className="min-h-screen h-100">
      <div className="grid grid-cols-6 h-full relative">
        <img
          src={TEMP_IMAGE_URL}
          alt="Therapy Session"
          className="absolute z-1 object-cover w-full h-full blur-sm"
        />
        <img
          src={TEMP_IMAGE_URL}
          alt="Therapy Session"
          className="absolute z-0 object-cover w-full h-full"
        />

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
