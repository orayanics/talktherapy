import { Link } from '@tanstack/react-router'
import type { NavItem } from '#/types/component'

export interface SidebarItemProps {
  items?: Array<NavItem>
}

export default function SidebarItem(props: SidebarItemProps) {
  const { items = [] } = props

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => {
        const { label, to, icon } = item
        return (
          <Link
            key={to}
            to={to}
            className="flex items-center transition-colors p-2 group no-underline"
            inactiveProps={{
              className: 'opacity-70 hover:opacity-100',
            }}
            activeProps={{
              className: 'rounded-md font-medium bg-base-300',
            }}
          >
            <span className="mr-4">{icon}</span>
            <p className="text-sm my-0!">{label}</p>
          </Link>
        )
      })}
    </nav>
  )
}
