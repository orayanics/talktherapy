import React, { useState } from 'react'
import { Bell, Menu } from 'lucide-react'

import type { USER_ROLE } from '@/types/account'
import { NAV_BY_ROLE } from '@/constants/sidebar'

import SidebarItem from './SidebarItem'
import { authClient } from '@/utils/auth-client'
import NotificationList from '../NotificationList'

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
    <aside className="drawer lg:drawer-open font-sans">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen">
        <div className="bg-white border-b border-slate-300 lg:hidden w-full flex flex-row items-center justify-end px-4 h-16 shrink-0">
          <label
            htmlFor="my-drawer-3"
            className="btn btn-square border border-slate-300"
          >
            <Menu className="h-5 w-5 text-black" />
          </label>

          <div className="items-center justify-end px-4 relative">
            <button
              className="btn btn-square border border-slate-300"
              onClick={() => setShow((s) => !s)}
            >
              <Bell size={19} strokeWidth={2.2} />
            </button>
            {show && (
              <div className="absolute z-20 right-0 mt-2">
                <NotificationList />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 w-full bg-slate-50 lg:z-10 relative overflow-auto">
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
        <div className="w-64 min-h-full bg-white flex flex-col pt-6 pb-4 lg:border-e border-slate-300">
          {/* Brand Logo */}
          <div className="px-6 flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-[18px] tracking-tight text-slate-900">
              TalkTherapy
            </span>
          </div>

          {/* Navigation Links mimicking HR Design */}
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
