import { createFileRoute, Link } from '@tanstack/react-router'
import FormProfile from '@/modules/profile/FormProfile'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_private/profile/edit')({
  loader: ({ context }) => context.session,
  component: RouteComponent,
})

function RouteComponent() {
  const session = Route.useLoaderData()
  const { id, name } = session

  return (
    <div className="space-y-6">
      <Link
        to="/profile"
        className="flex gap-2 items-center link link-hover text-slate-600"
      >
        <ArrowLeft size={16} />
        Back to Profile
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div
            className="bg-white rounded-lg p-8 text-slate-900 shadow-sm
          border border-slate-300
          relative overflow-hidden"
          >
            <div className="relative z-1">
              <div
                className="w-16 h-16 bg-slate-900
              rounded-lg flex items-center justify-center
               text-2xl font-bold text-white mb-4 "
              >
                {name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold leading-tight">{name}</h3>
            </div>
          </div>

          <div className="alert alert-info alert-soft shadow-sm">
            <p>
              <strong>Security Tip:</strong> Your profile information is visible
              to clinical staff. Ensure your display name matches your legal
              credentials.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
            <div className="p-7">
              <h2 className="text-lg font-bold text-slate-800">
                Account Settings
              </h2>
              <p className="text-sm text-slate-500">
                Update your personal information and public-facing profile.
              </p>
            </div>

            <FormProfile id={id} defaultName={name} />
          </div>
        </div>
      </div>
    </div>
  )
}
