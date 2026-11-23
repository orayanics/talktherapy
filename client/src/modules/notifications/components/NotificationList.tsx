import StateError from '#/components/State/StateError'
import StateLoading from '#/components/State/StateLoading'
import StateNull from '#/components/State/StateNull'
import { useNotifications } from '#/modules/notifications/hooks/useNotifications'
import { useEffect,useRef } from 'react'

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
          <NotificationRow key={n.id} n={n} markRead={markRead} />
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

import NotificationRow from './NotificationRow'
