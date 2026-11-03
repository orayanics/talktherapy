export default function StateLoading({
  fullpage = false,
  message,
}: {
  fullpage?: boolean
  message?: string
}) {
  return (
    <>
      {fullpage ? <Fullpage message={message} /> : <Base message={message} />}
    </>
  )
}

function Fullpage({ message }: { message?: string }) {
  return (
    <div
      role="status"
      className="bg-white h-screen flex flex-col items-center justify-center p-6"
    >
      <span className="loading loading-spinner loading-lg mb-4"></span>
      {message && <p className="text-sm opacity-60">{message}</p>}
    </div>
  )
}

function Base({ message }: { message?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center p-6"
    >
      <span className="loading loading-spinner loading-lg mb-4"></span>
      {message && <p className="text-sm opacity-60">{message}</p>}
    </div>
  )
}
