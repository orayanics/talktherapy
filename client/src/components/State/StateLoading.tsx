export default function StateLoading() {
  return (
    <div
      className="bg-white h-64 border rounded-lg border-slate-300 border-dashed shadow-sm
      flex flex-col items-center justify-center p-6
      "
    >
      <span className="loading loading-spinner text-slate-600 loading-lg mb-4"></span>
    </div>
  )
}
