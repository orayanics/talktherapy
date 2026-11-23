import type { NavItem,NavLink } from '#/types/component'
import { Link,useRouterState } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useId,useState } from 'react'

import SidebarChildLink from './SidebarChildLink'

export interface SidebarItemProps {
  items?: Array<NavItem>
  collapsed?: boolean
  onExpand?: () => void
}

export function NavigationLink({
  item,
  collapsed,
  exact = false,
}: {
  item: NavLink
  collapsed: boolean
  exact?: boolean
}) {
  return (
    <Link
      to={item.to}
      aria-label={item.label}
      title={collapsed ? item.label : undefined}
      activeOptions={{ exact }}
      className={`flex min-h-10 items-center rounded-lg px-3 py-2 gap-3 no-underline ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
      inactiveProps={{
        className: 'text-muted hover:bg-base-200 hover:text-base-content',
      }}
      activeProps={{
        className: 'font-medium bg-base-200 text-base-content',
        'aria-current': 'page',
      }}
    >
      <span aria-hidden="true" className="shrink-0 [&>svg]:size-4.5">
        {item.icon}
      </span>
      <span className={collapsed ? 'text-sm lg:hidden' : 'text-sm'}>
        {item.label}
      </span>
    </Link>
  )
}

function NavigationGroup({
  item,
  collapsed,
  pathname,
  onExpand,
}: {
  item: Extract<NavItem, { children: Array<NavLink> }>
  collapsed: boolean
  pathname: string
  onExpand?: () => void
}) {
  const active = item.children.some(
    (child) => pathname === child.to || pathname.startsWith(`${child.to}/`),
  )
  const [open, setOpen] = useState(active)
  const id = useId()
  return (
    <div>
      <button
        type="button"
        aria-label={item.label}
        aria-expanded={open}
        aria-controls={id}
        title={collapsed ? item.label : undefined}
        className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-base-200 ${active ? 'font-medium text-base-content' : 'text-muted'} ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
        onClick={() => {
          if (collapsed && onExpand) {
            onExpand()
            setOpen(true)
          } else setOpen(!open)
        }}
      >
        <span aria-hidden="true" className="shrink-0 [&>svg]:size-4.5">
          {item.icon}
        </span>
        <span className={collapsed ? 'lg:hidden' : undefined}>
          {item.label}
        </span>
        <ChevronRight
          aria-hidden="true"
          size={14}
          className={`${open ? 'rotate-90' : ''} ${collapsed ? 'lg:hidden' : ''}`}
        />
      </button>
      <ul
        id={id}
        hidden={!open}
        className={`m-0 ms-5 list-none space-y-1 border-s border-border ps-2 ${collapsed ? 'lg:ms-0 lg:border-0 lg:ps-0' : ''}`}
      >
        {item.children.map((child) => (
          <SidebarChildLink
            key={child.to}
            child={child}
            collapsed={collapsed}
          />
        ))}
      </ul>
    </div>
  )
}

export default function SidebarItem({
  items = [],
  collapsed = false,
  onExpand,
}: SidebarItemProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {items.map((item) =>
        'children' in item ? (
          <NavigationGroup
            key={`${item.label}-${pathname}`}
            item={item}
            collapsed={collapsed}
            pathname={pathname}
            onExpand={onExpand}
          />
        ) : (
          <NavigationLink key={item.to} item={item} collapsed={collapsed} />
        ),
      )}
    </nav>
  )
}
