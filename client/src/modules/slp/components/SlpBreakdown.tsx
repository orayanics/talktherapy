import type { AssessResponse } from '#/modules/slp/api/slp'
import SlpBreakdownWordRow from './SlpBreakdownWordRow'

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
        border border-slate-300 rounded-box
        bg-white "
      >
        <table className="table">
          <thead>
            <tr>
              <th>Word</th>
              <th className="text-right">Average estimate (%)</th>
              <th>Status</th>
              <th>Focus (lowest units)</th>
            </tr>
          </thead>
          <tbody>
            {result.analysis.structured.words
              .slice(0, 25)
              .map((word, index) => (
                <SlpBreakdownWordRow
                  key={`${word.word}-${index}`}
                  word={word}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
