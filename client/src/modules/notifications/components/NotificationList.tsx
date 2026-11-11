import { useEffect, useRef } from 'react'
import { useNotifications } from '#/modules/notifications/hooks/useNotifications'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import StateNull from '#/components/State/StateNull'

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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) void loadNextPage()
      },
      { rootMargin: '160px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, loadNextPage])

  const isNull = !isPending && !isError && notifications.length === 0

  return (
    <div className="flex h-full min-h-0 flex-col bg-white overflow-hidden">
      <div className="min-h-0 flex-1 divide-y divide-slate-50 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
        {isPending && <StateLoading />}
        {isError && <StateError />}
        {isNull && <StateNull />}
        {notifications.map((n) => (
          <div key={n.id} className={`group transition-colors`}>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-4">
                  {!n.read_at && (
                    <div
                      aria-label="status"
                      className="status status-primary"
                    ></div>
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
        ))}
        {hasNextPage && (
          <li ref={loadMoreRef} className="m-0! p-2 text-center">
            <button
              className="btn btn-ghost btn-sm"
              disabled={isFetchingNextPage}
              onClick={() => void loadNextPage()}
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </li>
        )}
      </div>
    </div>
  )
}
