import { createFileRoute } from '@tanstack/react-router'
import RegisterForm from '#/modules/register/components/RegisterForm'

export const Route = createFileRoute('/_public/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen h-100">
      <div className="grid grid-cols-6 h-full relative">
        <div
          className="z-1
        col-span-6 md:col-span-3 
        bg-white w-100 md:w-full mx-auto
        md:m-0 m-6 flex items-center justify-center"
        >
          <RegisterForm />
        </div>

        <div className="hidden md:block col-span-3"></div>
      </div>
    </div>
  )
}
