import type { AdminUser } from '#/modules/users/types/user'
import UserDetailsPanel from './UserDetailsPanel'
import Drawer from '#/components/Drawer'

export default function UserDetailsDrawer({
  user,
  onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  return (
    <Drawer
      isOpen
      onClose={onClose}
      label={`${user.name} details`}
      title="User Information"
      className="fixed inset-0 z-40"
      panelClassName="min-h-full w-full max-w-md overflow-y-auto bg-base-100 text-base-content "
    >
      <UserDetailsPanel user={user} />
    </Drawer>
  )
}
