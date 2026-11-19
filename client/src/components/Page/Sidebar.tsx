import React, { useState } from 'react'
import { Bell, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import type { USER_ROLE } from '#/modules/auth/types/account'
import { NAV_BY_ROLE } from '#/constants/sidebar'

import SidebarItem from './SidebarItem'
import { useLogoutMutation } from '#/modules/auth/hooks/useLogoutMutation'
import NotificationList from '#/modules/notifications/components/NotificationList'
import { useUnreadNotificationCount } from '#/modules/notifications/hooks/useNotifications'
import Drawer from '#/components/Drawer'
import Breadcrumbs from './Breadcrumbs'

const SIDEBAR_COLLAPSED_KEY = 'talktherapy.sidebar.collapsed'

export interface SidebarProps {
  children: React.ReactNode
  role: USER_ROLE
}

export default function Sidebar(props: SidebarProps) {
  const { children, role } = props
  const [show, setShow] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false

    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const { data: unreadCount = 0 } = useUnreadNotificationCount()

  const logout = useLogoutMutation()
  const navItems = NAV_BY_ROLE[role]

  const handleLogout = async () => {
    await logout.mutateAsync()
    window.location.href = '/login'
  }

  const toggleCollapsed = () => {
    setIsCollapsed((current) => {
      const next = !current

      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      } catch {
        // Storage can be unavailable in restricted browser contexts.
      }

      return next
    })
  }

  return (
    <Drawer
      isOpen={isMenuOpen}
      onClose={() => setMenuOpen(false)}
      hideHeader
      label="Navigation"
      position="start"
      className="lg:drawer-open"
      sideClassName="z-40 lg:z-1!"
      contentClassName="flex flex-col min-h-screen"
      panelClassName={`w-fit min-h-full bg-base-200 flex flex-col pt-6 pb-4 lg:border-e border-border ${isCollapsed ? 'lg:w-16' : 'lg:w-fit'}`}
      content={
        <>
          <div className="bg-white border-b border-border w-full flex flex-row items-center justify-between gap-2 px-4 h-14 shrink-0">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="btn btn-square btn-flat btn-sm hidden lg:inline-flex"
                onClick={toggleCollapsed}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-pressed={isCollapsed}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <PanelLeftOpen size={16} strokeWidth={2.5} />
                ) : (
                  <PanelLeftClose size={16} strokeWidth={2.5} />
                )}
              </button>

              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMenuOpen(true)}
                className="btn btn-square btn-flat btn-sm lg:hidden"
              >
                <Menu size={16} strokeWidth={2.5} />
              </button>
              <Breadcrumbs />
            </div>

            <div className="items-center justify-end relative">
              <button
                type="button"
                className={`btn btn-sm btn-flat btn-square relative ${unreadCount > 0 ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : ''}`}
                onClick={() => setShow((s) => !s)}
                aria-label={
                  unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : 'Notifications'
                }
                aria-expanded={show}
                aria-haspopup="dialog"
              >
                <Bell size={16} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 min-w-4 rounded-full bg-error px-1 text-[10px] font-bold leading-4 text-error-content"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {show && (
                <Drawer
                  isOpen
                  onClose={() => setShow(false)}
                  label="Notifications"
                  className="fixed inset-0 z-50"
                  sideClassName="z-50"
                  panelProps={{ role: 'dialog', 'aria-modal': true }}
                  panelClassName="flex h-full w-full max-w-md flex-col bg-white "
                >
                  <div className="min-h-0 flex-1 p-4 pt-2">
                    <NotificationList />
                  </div>
                </Drawer>
              )}
            </div>
          </div>
          <div className="bg-base-100 flex-1 h-full w-full lg:z-10 relative overflow-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        </>
      }
    >
      <div className="overflow-y-auto px-4 flex-1">
        <SidebarItem items={navItems} collapsed={isCollapsed} />
      </div>

      <div className="p-4 mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className={`btn btn-block btn-neutral w-full ${isCollapsed ? 'lg:btn-square' : ''}`}
        >
          <span className={isCollapsed ? 'lg:hidden' : undefined}>Logout</span>
        </button>
      </div>
    </Drawer>
  )
}
