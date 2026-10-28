import { Link } from '@tanstack/react-router'

export default function RoomPrompt({ roomId }: { roomId: string }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center text-center gap-6">
        <span className="loading loading-ring loading-lg mb-4"></span>

        <h1 className="text-5xl font-black uppercase md:text-6xl">
          Join Video Call
        </h1>

        <div>
          <p className="text-slate-900">
            Please allow camera and microphone permissions to join room
          </p>
          <p className="text-black font-bold font-mono kbd"> {roomId}</p>
        </div>

        <Link to="/dashboard" className="btn btn-neutral">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
