export default function StateNull() {
  return (
    <div
      className="bg-white h-64 border rounded-lg border-slate-300 border-dashed shadow-sm
      flex flex-col items-center justify-center p-6
      "
    >
      <div className="w-12 h-12 flex items-center justify-center mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-600"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <line x1="9" x2="15" y1="9" y2="9" />
          <line x1="9" x2="15" y1="15" y2="15" />
        </svg>
      </div>
      <p className="text-slate-600 font-semibold mb-1">No Data Found</p>
      <p className="text-slate-600 text-sm text-center max-w-sm">
        We couldn't find any records meeting your criteria.
      </p>
    </div>
  )
}
