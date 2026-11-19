import { Link } from '@tanstack/react-router'
import type { NavItem } from '#/types/component'

export interface SidebarItemProps {
  items?: Array<NavItem>
  collapsed?: boolean
}

export default function SidebarItem(props: SidebarItemProps) {
  const { items = [], collapsed = false } = props

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const { label, to, icon } = item
        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center transition-colors p-2 group no-underline ${collapsed ? 'lg:justify-center' : ''}`}
            inactiveProps={{
              className: 'opacity-70 hover:opacity-100',
            }}
            activeProps={{
              className: 'rounded-box font-medium bg-base-300',
            }}
          >
            <span className={collapsed ? 'mr-4 lg:mr-0' : 'mr-4'}>{icon}</span>
            <p
              className={
                collapsed ? 'text-sm my-0! lg:hidden' : 'text-sm my-0!'
              }
            >
              {label}
            </p>
          </Link>
        )
      })}
    </nav>
  )
}
