import { CircleAlert } from 'lucide-react'

export default function StateNull() {
  return (
    <div
      role="alert"
      className="bg-white flex flex-col items-center justify-center p-6"
    >
      <CircleAlert />
      <p className="font-medium mb-0!">No Data Found</p>
      <p className="opacity-60 text-sm text-center max-w-sm my-0!">
        We couldn't find any records meeting your criteria.
      </p>
    </div>
  )
}
