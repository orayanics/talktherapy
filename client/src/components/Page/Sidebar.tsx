import React, { useState } from 'react'
import {
  Bell,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'

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
      contentClassName="flex min-h-0 min-w-0 h-dvh flex-col"
      panelClassName={`app-sidebar w-60 max-w-[85vw] h-dvh bg-base-100 flex flex-col border-e border-border ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}`}
      content={
        <>
          <a href="#app-main" className="app-skip-link">
            Skip to content
          </a>
          <div className="bg-base-100 border-b border-border w-full flex items-center justify-between gap-3 px-4 sm:px-6 h-16 shrink-0">
            <div className="flex min-w-0 flex-1 items-center gap-3">
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
                aria-expanded={isMenuOpen}
                onClick={() => setMenuOpen(true)}
                className="btn btn-square btn-flat btn-sm lg:hidden"
              >
                <Menu size={16} strokeWidth={2.5} />
              </button>
              <Breadcrumbs />
            </div>

            <div className="shrink-0 items-center justify-end relative">
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
          <div className="min-h-0 min-w-0 flex-1 w-full relative overflow-auto">
            {children}
          </div>
        </>
      }
    >
      <div
        className={`flex h-16 shrink-0 items-center border-b border-border px-5 text-sm font-semibold tracking-tight ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
      >
        <span className={isCollapsed ? 'lg:hidden' : undefined}>
          TalkTherapy
        </span>
        {isCollapsed && (
          <span className="hidden lg:inline" aria-hidden="true">
            T
          </span>
        )}
        <button
          type="button"
          className="btn btn-sm btn-square btn-ghost ml-auto lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div
        className="overflow-y-auto p-3 flex-1"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) setMenuOpen(false)
        }}
      >
        <SidebarItem items={navItems} collapsed={isCollapsed} />
      </div>

      <div className="p-3 mt-auto border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className={`btn btn-ghost w-full justify-start ${isCollapsed ? 'lg:btn-square lg:justify-center' : ''}`}
        >
          <LogOut size={18} aria-hidden="true" />
          <span className={isCollapsed ? 'lg:hidden' : undefined}>Log out</span>
        </button>
      </div>
    </Drawer>
  )
}
