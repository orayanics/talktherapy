import { Calendar, Mail } from 'lucide-react'
import type { AdminUser } from '#/modules/users/types/user'
import { formatDate } from '#/utils/useDate'
import StatusPill from '#/components/Decorator/StatusPill'
import RolePill from '#/components/Decorator/RolePill'

export default function UserDetailsPanel({
  user,
}: {
  user: AdminUser
  onClose?: () => void
}) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">{user.name}</span>
          <StatusPill status={user.status} />
        </div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <Mail size={14} /> {user.email}
        </p>
        <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <Calendar size={14} /> {formatDate(user.created_at)}
        </p>
      </div>
      <RolePill role={user.role} />
    </div>
  )
}
