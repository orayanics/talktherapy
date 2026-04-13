import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationList() {
  const { notifications, markRead } = useNotifications()

  return (
    <div className="w-100 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/50">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
          Activity
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {notifications.length} New
        </span>
      </div>

      <ul className="divide-y divide-slate-50 max-h-95 overflow-auto">
        {notifications.map((n: any) => (
          <li
            key={n.id}
            className={`group transition-colors p-4 hover:bg-slate-50/80 ${!n.readAt ? 'bg-blue-50/30' : ''}`}
          >
            <div className="flex gap-3">
              <div aria-label="status" className="status status-primary"></div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800 leading-none">
                    {n.title}
                  </p>
                  <span className="text-[10px] text-slate-400">2m ago</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {n.message}
                </p>

                {!n.readAt && (
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
      </ul>
    </div>
  )
}
