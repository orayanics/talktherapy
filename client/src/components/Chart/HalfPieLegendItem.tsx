import type { HalfPieChartDatum } from './HalfPieChart'

export default function HalfPieLegendItem({
  item,
}: {
  item: HalfPieChartDatum
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{
            backgroundColor: item.color,
            // boxShadow: `0 0 8px 1px ${item.color}`,
          }}
        />
        <span className="truncate text-neutral">{item.label}</span>
      </span>
      <span className="font-mono font-bold tabular-nums">{item.value}</span>
    </div>
  )
}
