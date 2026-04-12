export default function RoomWaiting() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 backdrop-blur-md z-10 text-slate-900">
      <span className="loading loading-spinner loading-lg mb-4"></span>
      <h3 className="text-2xl font-semibold mb-2 uppercase">
        Waiting For Others
      </h3>
    </div>
  )
}
