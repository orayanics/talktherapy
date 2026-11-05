import React, { useState } from 'react'
import { Bell, Menu } from 'lucide-react'

import type { USER_ROLE } from '#/modules/auth/types/account'
import { NAV_BY_ROLE } from '#/constants/sidebar'

import SidebarItem from './SidebarItem'
import { authClient } from '#/modules/auth/api/auth-client'
import NotificationList from '#/modules/notifications/components/NotificationList'
import Drawer from '#/components/Drawer'

export interface SidebarProps {
  children: React.ReactNode
  role: USER_ROLE
}

export default function Sidebar(props: SidebarProps) {
  const { children, role } = props
  const [show, setShow] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)

  const navItems = NAV_BY_ROLE[role]

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/login'
        },
      },
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
      panelClassName="w-fit min-h-full bg-base-200 flex flex-col pt-6 pb-4 lg:border-e border-border"
      content={
        <>
          <div className="bg-white border-b border-border w-full flex flex-row items-center justify-end gap-2 p-4 h-14 shrink-0">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
              className="btn btn-square btn-flat btn-sm lg:hidden"
            >
              <Menu size={16} strokeWidth={2.5} />
            </button>

            <div className="items-center justify-end relative">
              <button
                className="btn btn-sm btn-flat btn-square"
                onClick={() => setShow((s) => !s)}
                aria-label="Notifications"
              >
                <Bell size={16} strokeWidth={2.5} />
              </button>
              {show && (
                <Drawer
                  isOpen
                  onClose={() => setShow(false)}
                  label="Notifications"
                  className="fixed inset-0 z-50"
                  sideClassName="z-50"
                  panelProps={{ role: 'dialog', 'aria-modal': true }}
                  panelClassName="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
                >
                  <div className="min-h-0 flex-1 p-4 pt-2">
                    <NotificationList />
                  </div>
                </Drawer>
              )}
            </div>
          </div>
          <div className="p-4 bg-base-100 flex-1 h-full w-full lg:z-10 relative overflow-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        </>
      }
    >
      <div className="overflow-y-auto px-4 flex-1">
        <SidebarItem items={navItems} />
      </div>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="btn btn-block btn-neutral w-full"
        >
          Logout
        </button>
      </div>
    </Drawer>
  )
}
