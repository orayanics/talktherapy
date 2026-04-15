import type { AssessResponse } from '@/api/slp'
import SlpPill from '@/components/Decorator/SlpPill'

interface SlpBreakdownProps {
  result: AssessResponse
}

export default function SlpBreakdown({ result }: SlpBreakdownProps) {
  const isShow = result.analysis.structured.words.length !== 0
  if (!isShow) return null
  return (
    <div className="space-y-2">
      <div className="uppercase font-medium">Word breakdown</div>
      <div
        className="mt-2 overflow-x-auto
        border border-slate-300 rounded-lg
        bg-white shadow-sm"
      >
        <table className="table">
          <thead>
            <tr>
              <th>Word</th>
              <th className="text-right">Correct Avg (%)</th>
              <th>Status</th>
              <th>Focus (lowest units)</th>
            </tr>
          </thead>
          <tbody>
            {result.analysis.structured.words.slice(0, 25).map((w, idx) => {
              const focus = w.lowUnits
                .slice(0, 4)
                .map((u) => `${u.unit}(${u.score.toFixed(0)}%)`)
                .join(', ')

              return (
                <tr key={`${w.word}-${idx}`}>
                  <td className="font-medium">{w.word}</td>
                  <td className="text-right font-mono">
                    {w.avgScore.toFixed(1)}%
                  </td>
                  <td>
                    <SlpPill status={w.status} />
                  </td>
                  <td>{focus || '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
