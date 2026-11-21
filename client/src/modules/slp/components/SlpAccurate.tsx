import type { AssessResponse } from '#/modules/slp/api/slp'

interface SlpAccurateProps {
  result: AssessResponse
}

export default function SlpAccurate({ result }: SlpAccurateProps) {
  const isShow = result.analysis.structured.accurateUnits.length !== 0
  if (!isShow) return null

  return (
    <div className="space-y-2">
      <div className="uppercase font-medium">Higher practice estimates</div>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {result.analysis.structured.accurateUnits.slice(0, 10).map((item) => (
          <AccurateUnitItem key={`acc-${item.unit}`} item={item} />
        ))}
      </ul>
    </div>
  )
}

import AccurateUnitItem from './AccurateUnitItem'
