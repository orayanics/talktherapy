import { createFileRoute, Link } from '@tanstack/react-router'
import { Home } from 'lucide-react'

export const Route = createFileRoute('/forbidden')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="bg-white flex h-screen flex-col items-center justify-center gap-4">
      <div className="border border-slate-300 rounded-lg p-4 mx-auto w-100">
        <h1 className="text-3xl font-bold">Forbidden</h1>
        <p className="mt-4 text-lg">
          You do not have permission to access this page or action.
        </p>

        <Link to={'/dashboard'} className="btn btn-neutral">
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  )
}
