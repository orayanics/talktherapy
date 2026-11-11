import { useId } from 'react'

export interface PieChartDatum {
  label: string
  value: number
  color: string
}

interface PieChartProps {
  data: PieChartDatum[]
  total?: number
  thickness?: number
  showLegend?: boolean
  glow?: number
  gap?: number
}

export default function PieChart({
  data,
  total = data.reduce((sum, item) => sum + item.value, 0),
  thickness = 28,
  showLegend = true,
  glow = 10,
  gap = 0,
}: PieChartProps) {
  const uid = useId().replace(/:/g, '')
  const glowId = `${uid}-glow`
  const softId = `${uid}-soft`

  const visibleData = data.filter((item) => item.value > 0)
  const chartTotal = total > 0 ? total : 1

  let cursor = 0
  const segments = visibleData.map((item) => {
    const percentage = (item.value / chartTotal) * 100
    const length = Math.max(percentage - gap, 0)
    const start = cursor + gap / 2
    cursor += percentage
    return { item, length, start }
  })

  const renderSegments = () =>
    segments.map(({ item, length, start }) => (
      <circle
        key={item.label}
        cx="100"
        cy="100"
        r="80"
        fill="none"
        pathLength="100"
        stroke={item.color}
        strokeWidth={thickness}
        strokeLinecap="butt"
        strokeDasharray={`${length} ${100 - length}`}
        strokeDashoffset={-start}
        transform="rotate(-90 100 100)"
      />
    ))

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(12rem,0.8fr)] md:items-center">
      <div
        className="relative"
        role="img"
        aria-label={`Patients by diagnosis: ${total} total`}
      >
        <svg
          viewBox="0 0 200 200"
          className="mx-auto w-full max-w-sm overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation={glow} />
              <feColorMatrix type="saturate" values="1.4" />
            </filter>
            <filter id={softId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation={glow * 0.3} />
            </filter>
          </defs>

          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            className="text-slate-100"
          />

          <g filter={`url(#${glowId})`} opacity={0.35}>
            {renderSegments()}
          </g>
          <g filter={`url(#${softId})`} opacity={0.45}>
            {renderSegments()}
          </g>

          <g>{renderSegments()}</g>

          <text
            x="100"
            y="96"
            textAnchor="middle"
            className="fill-slate-900 font-mono text-[18px] font-bold tabular-nums"
          >
            {total}
          </text>
          <text
            x="100"
            y="110"
            textAnchor="middle"
            className="fill-slate-500 text-[7px] uppercase tracking-[0.18em]"
          >
            patients
          </text>
        </svg>
      </div>

      {showLegend && (
        <ul className="grid grid-cols-1 gap-2 text-sm">
          {data.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3"
            >
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
          ))}
        </ul>
      )}
    </div>
  )
}
