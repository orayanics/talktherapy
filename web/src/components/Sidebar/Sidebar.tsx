import { Menu } from 'lucide-react'
import SidebarNavItems from './SidebarNavItems'
import type { SidebarProps } from '~/models/components'
import { NAV_BY_ROLE } from '~/config/sidebar'

import LogoText from '~/components/Logo/LogoText'
import NotificationBell from '~/components/Notification/NotificationBell'
import { useLogout } from '~/api/auth'
import { useSession } from '~/context/SessionContext'
import { useNotificationSocket } from '~/hooks/useNotificationSocket'

export default function Sidebar(props: SidebarProps) {
  const { children, role } = props
  const navItems = NAV_BY_ROLE[role]
  const session = useSession()

  const { mutateAsync: logout } = useLogout()
  const handleLogout = async () => {
    await logout()
  }

  // Connect only when a valid session is confirmed
  useNotificationSocket({ enabled: !!session.id })

  return (
    <aside className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        <div className="bg-white border-b lg:border-0 w-full flex flex-row justify-between lg:justify-end items-center">
          <label
            htmlFor="my-drawer-3"
            className="btn btn-primary m-4 lg:hidden"
          >
            <Menu />
          </label>
          <NotificationBell />
        </div>
        {children}
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="menu bg-white border-r min-h-full w-64 gap-2 p-0 flex flex-col">
          <LogoText />
          <SidebarNavItems items={navItems} />
          <div className="mt-auto">
            <div className="m-2">
              <button onClick={handleLogout} className="btn btn-primary w-full">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
