import { useState } from 'react'
import { Bell } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import type { NotificationDto } from '~/models/notification'
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from '~/api/notifications'

import Loader from '~/components/Loader/Loader'

function NotificationItem({
  notification,
  onRead,
}: {
  notification: NotificationDto
  onRead: (id: string) => void
}) {
  const isUnread = notification.read_at === null
  const timeAgo = formatDistanceToNow(parseISO(notification.created_at), {
    addSuffix: true,
  })

  return (
    <li
      className={`p-4 border-b cursor-pointer transition-colors ${isUnread ? 'bg-primary/5' : ''}`}
      onClick={() => isUnread && onRead(notification.id)}
    >
      <div className="flex items-start">
        {isUnread && (
          <>
            <span className="status status-primary relative top-1 animate-ping" />
            <span className="status status-primary relative top-1 -left-2" />
          </>
        )}
        <div className={`flex-1`}>
          <p className="text-sm font-semibold leading-tight">
            {notification.title}
          </p>
          <p className="text-xs text-base-content/70 mt-0.5 leading-snug">
            {notification.message}
          </p>
          <p className="text-xs text-base-content/40 mt-1">{timeAgo}</p>
        </div>
      </div>
    </li>
  )
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: listData, isLoading } = useNotifications(1, 20)
  const { mutate: markAllRead } = useMarkAllRead()
  const { mutate: markRead } = useMarkRead()

  const displayCount =
    unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : null

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const notifications: Array<NotificationDto> = listData?.data ?? []

  return (
    <div
      className="dropdown dropdown-bottom dropdown-end mr-4 lg:absolute lg:top-4"
      onClick={handleToggle}
    >
      <div tabIndex={0} role="button" className="indicator btn">
        {displayCount && (
          <span className="indicator-item indicator-start badge badge-primary badge-sm">
            {displayCount}
          </span>
        )}
        <Bell />
      </div>

      <div
        tabIndex={-1}
        className="dropdown-content card border bg-base-100 rounded-box z-50 w-82 shadow-sm"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <p className="font-semibold text-sm">Notifications</p>
          {notifications.some((n) => !n.read_at) && (
            <button
              type="button"
              className="btn btn-ghost text-xs text-primary"
              onClick={() => markAllRead()}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Scrollable list */}
        <ul className="overflow-y-auto max-h-80">
          {isLoading ? (
            <li className="text-center p-6">
              <Loader />
            </li>
          ) : notifications.length === 0 ? (
            <li className="p-6 text-center text-sm text-gray-400">
              No notifications yet.
            </li>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={(id) => markRead(id)}
              />
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
