import { createFileRoute, Link } from '@tanstack/react-router'
import { Calendar, Mail, User, ShieldCheck } from 'lucide-react'
import { formatDate } from '@/utils/useDate'
import { useSession } from '@/context/SessionContext'

export const Route = createFileRoute('/_private/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  const session = useSession()
  const { name, email, createdAt, diagnosis } = session

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <div
            className="bg-white rounded-lg p-4 text-slate-900 shadow-sm
          border border-slate-300 space-y-2"
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
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-300 rounded-lg shadow-sm">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <ShieldCheck size={16} />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Account Details
              </h3>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <p className="text-slate-700 font-medium">{email}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Calendar size={12} /> Member Since
                </label>
                <p className="text-slate-700 font-mono text-sm">
                  {formatDate(createdAt)}
                </p>
              </div>
            </div>

            {diagnosis && (
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  Specialty
                </label>
                <p className="text-slate-700 font-mono text-sm">{diagnosis}</p>
              </div>
            )}
          </div>

          <Link to="/profile/edit" className="btn btn-neutral btn-block">
            <User size={16} />
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  )
}
