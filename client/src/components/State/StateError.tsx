export default function StateError() {
  return (
    <div
      className="bg-white h-64 border rounded-lg border-rose-300 border-dashed shadow-sm
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
          className="text-rose-500"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <p className="text-rose-600 font-semibold mb-1">Error Loading Data</p>
      <p className="text-slate-600 text-sm text-center max-w-sm">
        We couldn't retrieve the requested information. Please try refreshing.
      </p>
    </div>
  )
}
