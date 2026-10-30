import React, { useState } from 'react'
import { Bell, Menu, X } from 'lucide-react'

import type { USER_ROLE } from '#/types/account'
import { NAV_BY_ROLE } from '#/constants/sidebar'

import SidebarItem from './SidebarItem'
import { authClient } from '#/modules/auth/api/auth-client'
import NotificationList from '#/modules/notifications/components/NotificationList'

export interface SidebarProps {
  children: React.ReactNode
  role: USER_ROLE
}

export default function Sidebar(props: SidebarProps) {
  const { children, role } = props
  const [show, setShow] = useState(false)

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
    <aside className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen">
        <div className="bg-white border-b border-border w-full flex flex-row items-center justify-end gap-2 p-4 h-14 shrink-0">
          <label
            htmlFor="my-drawer-3"
            className="btn btn-square btn-flat btn-sm lg:hidden"
          >
            <Menu size={16} strokeWidth={2.5} />
          </label>

          <div className="items-center justify-end relative">
            <button
              className="btn btn-sm btn-flat btn-square"
              onClick={() => setShow((s) => !s)}
              aria-label="Notifications"
            >
              <Bell size={16} strokeWidth={2.5} />
            </button>
            {show && (
              <div
                className="fixed inset-0 z-50"
                role="dialog"
                aria-modal="true"
                aria-label="Notifications"
              >
                <button
                  className="absolute inset-0 bg-slate-900/30"
                  aria-label="Close notifications"
                  onClick={() => setShow(false)}
                />
                <section className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2">
                    <p className="my-0!">Notifications</p>
                    <button
                      className="btn btn-sm btn-flat btn-square"
                      onClick={() => setShow(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 p-4 pt-2">
                    <NotificationList />
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-base-100 flex-1 h-full w-full lg:z-10 relative overflow-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>

      <div className="drawer-side z-1!">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>

        {/* Sidebar Panel */}
        <div className="w-fit min-h-full bg-base-200 flex flex-col pt-6 pb-4 lg:border-e border-border">
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
        </div>
      </div>
    </aside>
  )
}
