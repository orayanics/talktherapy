import type { NotificationItem } from '../types/notification'

export default function NotificationRow({
  n,
  markRead,
}: {
  n: NotificationItem
  markRead: (id: string) => Promise<void>
}) {
  return (
    <div className={`group transition-colors`}>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-4">
            {!n.read_at && (
              <div aria-label="status" className="status status-primary"></div>
            )}
            <p className="text-xs font-semibold text-slate-800 leading-none">
              {n.title}
            </p>
          </div>
          <p className="text-xs opacity-60 my-0!">{n.message}</p>

          {!n.read_at && (
            <button
              onClick={() => markRead(n.id)}
              className="link link-primary link-hover mt-2 text-xs"
            >
              Mark as viewed
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
