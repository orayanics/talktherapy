import { useEffect, useRef } from 'react'
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
  const loadMoreRef = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasNextPage) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isFetchingNextPage) void loadNextPage()
    }, { rootMargin: '160px' })
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, loadNextPage])

  return (
    <div className="flex h-full min-h-0 flex-col bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/50">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
          Activity
        </h3>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-slate-50 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <li ref={loadMoreRef} className="p-3 text-center">
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
