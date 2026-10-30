import { CircleAlert } from 'lucide-react'

export default function StateError() {
  return (
    <div
      role="alert"
      className="bg-white flex flex-col items-center justify-center p-6"
    >
      <CircleAlert className="text-error" />
      <p className="text-error font-medium mb-0!">Something went wrong!</p>
      <p className="opacity-60 text-sm text-center max-w-sm my-0!">
        We couldn't retrieve the requested information. Please try refreshing.
      </p>
    </div>
  )
}
