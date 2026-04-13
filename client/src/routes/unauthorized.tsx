import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/unauthorized')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-white px-6">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <span className="text-[25vw] font-black uppercase tracking-tighter text-neutral-50/80 select-none">
          Lost
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <h1 className="text-8xl font-black uppercase tracking-tighter text-slate-900 md:text-9xl">
          Oops!
        </h1>

        <div className="max-w-sm">
          <div className="text-lg font-medium leading-tight text-slate-900">
            <p>You are not authorized to view this page.</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={() => window.history.back()}
            className="btn btn-neutral"
          >
            Go Back
          </button>

          <Link to="/" className="btn btn-neutral">
            Take Me Home
          </Link>
        </div>
      </div>
    </div>
  )
}
