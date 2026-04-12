import React from 'react'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationList() {
  const { notifications, markRead } = useNotifications()

  return (
    <div className="bg-white border shadow-md w-80 p-2">
      <div className="font-bold px-2 py-1">Notifications</div>
      <ul className="divide-y max-h-64 overflow-auto">
        {notifications.map((n: any) => (
          <li key={n.id} className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-slate-600">{n.message}</div>
              </div>
              <div className="ml-2">
                {!n.readAt && (
                  <button className="btn btn-xs" onClick={() => markRead(n.id)}>
                    Mark
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
