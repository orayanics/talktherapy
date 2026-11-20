import type { AdminUser } from '#/modules/users/types/user'

import { formatDate } from '#/utils/useDate'
import StatusPill from '#/modules/users/components/StatusPill'
import RolePill from '#/modules/users/components/RolePill'

export default function UserDetailsPanel({
  user,
}: {
  user: AdminUser
  onClose?: () => void
}) {
  return (
    <div className="p-6 space-y-6">
      <div>
        {/* User Information */}
        <div className="flex flex-col gap-2 border-b border-dashed border-border pb-6">
          <span className="text-2xl font-bold">{user.name}</span>
          <span className="text-muted">{user.email}</span>
          <StatusPill status={user.status} />
        </div>

        {/* Account Information */}

        <div className="flex items-center justify-between gap-2 mt-6">
          <span className="font-semibold">Role</span>
          <RolePill role={user.role} />
        </div>

        <div className="flex items-center justify-between gap-2 mt-6">
          <span className="font-semibold">Diagnosis</span>
          <span>{user.diagnosis_id}</span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-6">
          <span className="font-semibold">Verified At</span>
          <span>{formatDate(user.email_verified_at)}</span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-6">
          <span className="font-semibold">Created At</span>
          <span>{formatDate(user.created_at)}</span>
        </div>
      </div>
    </div>
  )
}
