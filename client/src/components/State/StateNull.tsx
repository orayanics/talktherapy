import { CircleAlert } from 'lucide-react'

export default function StateNull({
  title = 'No Data Found',
  message = "We couldn't find any records meeting your criteria.",
  children,
}: {
  title?: string
  message?: string
  children?: React.ReactNode
}) {
  return (
    <div
      role="alert"
      className="bg-white flex flex-col items-center justify-center p-6"
    >
      <CircleAlert />
      <p className="font-medium mb-0!">{title}</p>
      <p className="opacity-60 text-sm text-center max-w-sm my-0!">{message}</p>

      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
