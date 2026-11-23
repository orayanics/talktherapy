import type { AdminUser } from '#/modules/users/types/user'

export default function NotificationUserOption({
  user,
  selected,
  onToggle,
}: {
  user: AdminUser
  selected: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-3 p-3 hover:bg-primary/5">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={selected}
          onChange={onToggle}
        />
        <span className="min-w-0">
          <span className="block truncate text-xs font-medium">
            {user.name}
          </span>
          <span className="block truncate text-xs text-muted">
            {user.email}
          </span>
        </span>
      </label>
    </div>
  )
}
