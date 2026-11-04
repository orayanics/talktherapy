import { useId } from 'react'
import { X } from 'lucide-react'
import type { AdminUser } from '#/modules/users/types/user'
import UserDetailsPanel from './UserDetailsPanel'

export default function UserDetailsDrawer({
  user,
  onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  const id = useId()

  return (
    <div className="drawer drawer-end fixed inset-0 z-40">
      <input
        id={id}
        type="checkbox"
        className="drawer-toggle"
        checked
        readOnly
      />
      <div className="drawer-content" />

      <div className="drawer-side">
        <label
          htmlFor={id}
          aria-label="Close user details"
          className="drawer-overlay"
          onClick={onClose}
        />

        <aside
          aria-label={`${user.name} details`}
          className="min-h-full w-full max-w-md overflow-y-auto bg-base-100 text-base-content shadow-2xl"
        >
          <div className="flex justify-between items-end p-6 border-border border-b">
            <span>User Information</span>
            <button
              type="button"
              className="btn btn-sm btn-square btn-neutral"
              aria-label="Close user details"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>

          <UserDetailsPanel user={user} />
        </aside>
      </div>
    </div>
  )
}
