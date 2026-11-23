import type { UnitAssessment } from '../api/slp'

export default function ImprovementUnitItem({ item }: { item: UnitAssessment }) {
  return (
    <li
      className="bg-white  rounded-box
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
        {item.avgScore.toFixed(1)}% practice estimate
      </div>
    </li>
  )
}
