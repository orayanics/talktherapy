import { Link } from '@tanstack/react-router'
import FormProfile from '#/modules/profile/components/FormProfile'
import { ArrowLeft } from 'lucide-react'
import { useSession } from '#/modules/auth/context/SessionContext'

export default function EditProfilePage() {
  const session = useSession()
  const { name, email } = session
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
            className="bg-white rounded-box p-8 text-slate-900 
          border border-slate-300
          relative overflow-hidden"
          >
            <div className="relative z-1">
              <div
                className="w-16 h-16 bg-slate-900
              rounded-box flex items-center justify-center
               text-2xl font-bold text-white mb-4 "
              >
                {name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold leading-tight">{name}</h3>
            </div>
          </div>

          <div className="alert alert-info alert-soft ">
            <p>
              <strong>Security Tip:</strong> Your profile information is visible
              to clinical staff. Ensure your display name matches your legal
              credentials.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-300 rounded-box  p-7 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Account Settings
              </h2>
              <p className="text-sm text-slate-500">
                Update your personal information and public-facing profile.
              </p>
            </div>

            <FormProfile defaultName={name} defaultEmail={email} />
          </div>
        </div>
      </div>
    </div>
  )
}
