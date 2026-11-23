import type { PieChartDatum } from './PieChart'

export default function PieLegendItem({ item }: { item: PieChartDatum }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{
            backgroundColor: item.color,
            boxShadow: `0 0 8px 1px ${item.color}`,
          }}
        />
        <span className="truncate text-slate-600">{item.label}</span>
      </span>
      <span className="font-mono font-bold tabular-nums text-slate-800">
        {item.value}
      </span>
    </li>
  )
}
