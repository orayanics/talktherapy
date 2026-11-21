import type { AssessResponse } from '#/modules/slp/api/slp'
import SlpPill from '#/modules/slp/components/SlpPill'

type Word = AssessResponse['analysis']['structured']['words'][number]

export default function SlpBreakdownWordRow({ word }: { word: Word }) {
  const focus = word.lowUnits
    .slice(0, 4)
    .map((unit) => `${unit.unit}(${unit.score.toFixed(0)}%)`)
    .join(', ')

  return (
    <tr>
      <td className="font-medium">{word.word}</td>
      <td className="text-right font-mono">{word.avgScore.toFixed(1)}%</td>
      <td>
        <SlpPill status={word.status} />
      </td>
      <td>{focus || '-'}</td>
    </tr>
  )
}
