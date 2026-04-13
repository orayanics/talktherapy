import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'

export default function RoomDenied() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center text-center px-6 gap-6 max-w-2xl">
        <div className="flex flex-col justify-center items-center">
          <X className="text-error w-10 h-10 mb-4 animate-bounce" />
          <h1 className="text-5xl font-black uppercase md:text-6xl">
            Access Denied
          </h1>
        </div>

        <div className="max-w-md">
          <p className="text-slate-900">
            Camera and microphone are required to join this room. Please allow
            permissions and refresh the page.
          </p>
        </div>

        <div className="space-x-4">
          <Link to="." className="btn btn-neutral">
            Refresh
          </Link>

          <Link to="/dashboard" className="btn btn-ghost">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
