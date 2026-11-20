import { Link } from '@tanstack/react-router'
import type { NavItem } from '#/types/component'

export interface SidebarItemProps {
  items?: Array<NavItem>
  collapsed?: boolean
}

export default function SidebarItem(props: SidebarItemProps) {
  const { items = [], collapsed = false } = props

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {items.map((item) => {
        const { label, to, icon } = item
        return (
          <Link
            key={to}
            to={to}
            aria-label={label}
            title={collapsed ? label : undefined}
            className={`flex min-h-10 items-center rounded-lg px-3 py-2 gap-3 no-underline ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
            inactiveProps={{
              className: 'text-muted hover:bg-base-200 hover:text-base-content',
            }}
            activeProps={{
              className: 'font-medium bg-base-200 text-base-content',
            }}
          >
            <span aria-hidden="true" className="shrink-0 [&>svg]:size-4.5">
              {icon}
            </span>
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
