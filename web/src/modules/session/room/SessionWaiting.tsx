export default function SessionWaiting({
  roomId,
  isPatient,
}: {
  roomId: string
  isPatient: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="loading loading-ring loading-lg text-primary" />
      <div>
        <p className="text-gray-700 text-lg font-semibold">
          Waiting for the other participant…
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Share Room ID{' '}
          <span className="font-mono text-primary">#{roomId.slice(0, 8)}</span>{' '}
          with your {isPatient ? 'clinician' : 'patient'}.
        </p>
      </div>
    </div>
  )
}
