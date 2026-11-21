import type { AssessResponse } from '#/modules/slp/api/slp'

interface SlpImprovementProps {
  result: AssessResponse
}

export default function SlpImprovement({ result }: SlpImprovementProps) {
  const isShow = result.analysis.structured.needsWorkUnits.length !== 0
  if (!isShow) return null
  return (
    <div className="space-y-2">
      <p className="uppercase font-medium">Areas to practice</p>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {result.analysis.structured.needsWorkUnits.slice(0, 10).map((item) => (
          <ImprovementUnitItem key={`needs-${item.unit}`} item={item} />
        ))}
      </ul>
    </div>
  )
}

import ImprovementUnitItem from './ImprovementUnitItem'
