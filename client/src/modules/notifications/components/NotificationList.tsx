import { useNotifications } from '#/modules/notifications/hooks/useNotifications'

export default function NotificationList() {
  const {
    notifications,
    markRead,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    loadNextPage,
  } = useNotifications()

  return (
    <div className="w-100 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/50">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
          Activity
        </h3>
      </div>

      <ul className="divide-y divide-slate-50 max-h-95 overflow-auto">
        {isPending && (
          <li className="p-4 text-xs text-slate-500">Loading notifications…</li>
        )}
        {isError && (
          <li className="p-4 text-xs text-red-600">
            Notifications could not be loaded.
          </li>
        )}
        {!isPending && !isError && notifications.length === 0 && (
          <li className="p-4 text-xs text-slate-500">No notifications yet.</li>
        )}
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`group transition-colors p-4 hover:bg-slate-50/80 ${!n.read_at ? 'bg-blue-50/30' : ''}`}
          >
            <div className="flex gap-3">
              <div aria-label="status" className="status status-primary"></div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800 leading-none">
                    {n.title}
                  </p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {n.message}
                </p>

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
          </li>
        ))}
        {hasNextPage && (
          <li className="p-3 text-center">
            <button
              className="link link-primary text-xs"
              disabled={isFetchingNextPage}
              onClick={() => void loadNextPage()}
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </li>
        )}
      </ul>
    </div>
  )
}
