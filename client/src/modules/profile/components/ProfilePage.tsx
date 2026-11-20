import { Link } from '@tanstack/react-router'
import { Calendar, Mail, User, ShieldCheck } from 'lucide-react'
import { formatDate } from '#/utils/useDate'
import { useSession } from '#/modules/auth/context/SessionContext'
import { useNotificationPreferences } from '#/modules/notifications/hooks/useNotificationPreferences'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const session = useSession()
  const { name, email, createdAt } = session
  const preferences = useNotificationPreferences()
  const [draft, setDraft] = useState({ in_app: true, email: true })
  useEffect(() => {
    if (preferences.data) setDraft(preferences.data)
  }, [preferences.data])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <div
            className="bg-white rounded-box p-4 text-slate-900 
          border border-border space-y-2"
          >
            <div className="relative z-1">
              <div
                className="w-16 h-16 bg-slate-900
              rounded-box flex items-center justify-center
               text-2xl font-bold text-white mb-4 "
              >
                {name.charAt(0)}
              </div>
              <h3 className="text-lg font-semibold leading-tight break-words">
                {name}
              </h3>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-border rounded-box ">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <ShieldCheck size={16} />
              <h3 className="text-base font-semibold">Account Details</h3>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <p className="text-base-content break-all">{email}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted flex items-center gap-2">
                  <Calendar size={12} /> Member Since
                </label>
                <p className="text-base-content tabular-nums text-sm">
                  {formatDate(createdAt)}
                </p>
              </div>
            </div>
          </div>

          <Link to="/profile/edit" className="btn btn-neutral btn-block">
            <User size={16} />
            Edit Profile
          </Link>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void preferences.update(draft)
            }}
            className="bg-white border border-border rounded-box  p-4 space-y-3"
          >
            <h3 className="font-semibold">Notification preferences</h3>
            <label className="flex items-center justify-between">
              <span>In-app notifications</span>
              <input
                className="toggle"
                type="checkbox"
                checked={draft.in_app}
                onChange={(event) =>
                  setDraft({ ...draft, in_app: event.target.checked })
                }
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Email notifications</span>
              <input
                className="toggle"
                type="checkbox"
                checked={draft.email}
                onChange={(event) =>
                  setDraft({ ...draft, email: event.target.checked })
                }
              />
            </label>
            <button
              className="btn btn-sm btn-neutral"
              disabled={preferences.isUpdating}
            >
              Save preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
