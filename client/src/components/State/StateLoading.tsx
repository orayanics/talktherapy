export default function StateLoading({
  fullpage = false,
}: {
  fullpage?: boolean
}) {
  return <>{fullpage ? <Fullpage /> : <Base />}</>
}

function Fullpage() {
  return (
    <div className="bg-white h-screen flex flex-col items-center justify-center p-6">
      <span className="loading loading-spinner loading-lg mb-4"></span>
    </div>
  )
}

function Base() {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <span className="loading loading-spinner loading-lg mb-4"></span>
    </div>
  )
}
