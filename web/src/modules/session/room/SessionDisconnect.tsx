import { useNavigate } from '@tanstack/react-router'
import { WifiOff } from 'lucide-react'

export default function SessionDisconnect() {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center gap-6">
      <WifiOff size={52} className="text-error" />
      <div className="text-center">
        <p className="text-gray-800 text-xl font-semibold">
          Session Disconnected
        </p>
        <p className="text-gray-600 text-sm mt-1">
          The connection to the session room was lost.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          className="btn btn-primary"
          onClick={() =>
            navigate({
              to: '.',
              search: (prev) => ({ ...prev, reconnect: 'true' }),
            })
          }
        >
          Reconnect
        </button>
        <button
          className="btn btn-neutral"
          onClick={() => navigate({ to: '/dashboard' })}
        >
          Leave
        </button>
      </div>
    </div>
  )
}
