import React from 'react'

export default function SkeletonNull() {
  return (
    <div className="py-10 text-center text-gray-500 flex flex-col gap-4 items-center justify-center border border-dashed rounded-lg">
      <span className="text-sm">No data available</span>
    </div>
  )
}
