import type { NavLink } from '#/types/component'
import { NavigationLink } from './SidebarItem'

export default function SidebarChildLink({
  child,
  collapsed,
}: {
  child: NavLink
  collapsed: boolean
}) {
  return (
    <li>
      <NavigationLink item={child} collapsed={collapsed} exact />
    </li>
  )
}
