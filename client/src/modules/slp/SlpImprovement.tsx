import type { AssessResponse } from '@/api/slp'

interface SlpImprovementProps {
  result: AssessResponse
}

export default function SlpImprovement({ result }: SlpImprovementProps) {
  const isShow = result.analysis.structured.needsWorkUnits.length !== 0
  if (!isShow) return null
  return (
    <div className="space-y-2">
      <p className="uppercase font-medium">Needs improvement</p>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {result.analysis.structured.needsWorkUnits.slice(0, 10).map((item) => (
          <li
            key={`needs-${item.unit}`}
            className="bg-white shadow-sm rounded-lg
                border border-slate-300
                flex items-start justify-between gap-3 p-3"
          >
            <div>
              <div className="font-mono">{item.unit}</div>
              {item.examples?.length ? (
                <div className="text-xs text-slate-500">
                  e.g. {item.examples.join(', ')}
                </div>
              ) : null}
            </div>
            <div className="font-mono tabular-nums text-sm">
              {item.avgScore.toFixed(1)}% correct
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
