import { useId } from 'react'

export interface HalfPieChartDatum {
  label: string
  value: number
  color: string
}

interface HalfPieChartProps {
  data: HalfPieChartDatum[]
  total?: number
  thickness?: number
  showLegend?: boolean
  glow?: number
  gap?: number
  smooth?: boolean
}

const ARC = 'M 20 100 A 80 80 0 0 1 180 100'

// Arc progress (0-1 along the half circle) -> horizontal gradient offset (0-1).
const arcToOffset = (t: number) => (1 - Math.cos(Math.PI * t)) / 2

export default function HalfPieChart({
  data,
  total = data.reduce((sum, item) => sum + item.value, 0),
  thickness = 28,
  showLegend = true,
  glow = 10,
  gap = 0,
  smooth = true,
}: HalfPieChartProps) {
  const uid = useId().replace(/:/g, '')
  const glowId = `${uid}-glow`
  const softId = `${uid}-soft`
  const gradId = `${uid}-grad`

  const visibleData = data.filter((item) => item.value > 0)
  const chartTotal = total > 0 ? total : 1

  let cursor = 0
  const segments = visibleData.map((item) => {
    const percentage = (item.value / chartTotal) * 100
    const length = Math.max(percentage - gap, 0)
    const start = cursor + gap / 2
    const mid = cursor + percentage / 2
    cursor += percentage
    return { item, length, start, mid }
  })

  const stops = segments.length
    ? [
        { offset: 0, color: segments[0].item.color },
        ...segments.map((s) => ({
          offset: arcToOffset(
            Math.min(s.mid, chartTotal === 0 ? 100 : 100) / 100,
          ),
          color: s.item.color,
        })),
        { offset: 1, color: segments[segments.length - 1].item.color },
      ]
    : []

  const renderSegments = () =>
    segments.map(({ item, length, start }) => (
      <path
        key={item.label}
        d={ARC}
        fill="none"
        pathLength="100"
        stroke={smooth ? `url(#${gradId})` : item.color}
        strokeWidth={thickness}
        strokeLinecap="butt"
        strokeDasharray={`${length} ${100 - length}`}
        strokeDashoffset={-start}
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
          viewBox="0 0 200 120"
          className="mx-auto w-full max-w-sm overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={gradId}
              gradientUnits="userSpaceOnUse"
              x1="20"
              y1="0"
              x2="180"
              y2="0"
            >
              {stops.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
            <filter id={glowId} x="-30%" y="-30%" width="160%" height="180%">
              <feGaussianBlur stdDeviation={glow} />
              <feColorMatrix type="saturate" values="1.4" />
            </filter>
            <filter id={softId} x="-30%" y="-30%" width="160%" height="180%">
              <feGaussianBlur stdDeviation={glow * 0.3} />
            </filter>
          </defs>

          <path
            d={ARC}
            fill="none"
            pathLength="100"
            stroke="currentColor"
            strokeWidth={thickness}
            strokeLinecap="butt"
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
