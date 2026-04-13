import { Link } from '@tanstack/react-router'
import type { NavItem } from '@/types/component'

export interface SidebarItemProps {
  items?: Array<NavItem>
}

export default function SidebarItem(props: SidebarItemProps) {
  const { items = [] } = props

  return (
    <nav className="flex flex-col gap-1 mb-6">
      {items.map((item) => {
        const { label, to, icon } = item
        return (
          <Link
            key={to}
            to={to}
            className="flex items-center px-3 py-2 rounded-lg  transition-colors group"
            inactiveProps={{
              className: 'text-slate-500 hover:bg-white hover:text-slate-900',
            }}
            activeProps={{
              className:
                'text-primary [&>span]:drop-shadow [&>span]:drop-shadow-primary/30',
            }}
          >
            <span className="mr-3 h-5 w-4 opacity-70">{icon}</span>
            <p className="font-semibold text-sm">{label}</p>
          </Link>
        )
      })}
    </nav>
  )
}
