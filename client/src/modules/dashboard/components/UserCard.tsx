type RoleTheme = {
  card: string
  muted: string
  track: string
  fill: string
}

const ROLE_THEME: Partial<Record<string, RoleTheme>> = {
  superadmin: {
    card: 'bg-green-800 text-green-50',
    muted: 'text-green-200',
    track: 'text-green-700',
    fill: 'text-green-300',
  },
  admin: {
    card: 'bg-rose-800 text-rose-50',
    muted: 'text-rose-200',
    track: 'text-rose-700',
    fill: 'text-rose-300',
  },
  clinician: {
    card: 'bg-amber-800 text-amber-50',
    muted: 'text-amber-200',
    track: 'text-amber-700',
    fill: 'text-amber-300',
  },
  patient: {
    card: 'bg-sky-800 text-sky-50',
    muted: 'text-sky-200',
    track: 'text-sky-700',
    fill: 'text-sky-300',
  },
}

const DEFAULT_THEME: RoleTheme = {
  card: 'bg-gray-800 text-gray-50',
  muted: 'text-gray-200',
  track: 'text-gray-700',
  fill: 'text-gray-300',
}

type UserCardProps = {
  role: string
  count: number
  total?: number
}

export default function UserCard({ role, count, total }: UserCardProps) {
  const theme = ROLE_THEME[role] ?? DEFAULT_THEME
  const ratio = total && total > 0 ? Math.min(count / total, 1) : 0
  const percent = Math.round(ratio * 100)
  const needleAngle = ratio * 180 - 90

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-md p-6 shadow-sm ${theme.card}`}
    >
      <p className="text-lg uppercase">{role}</p>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-semibold text-white">{count}</span>
        {total !== undefined && (
          <span className={`text-base ${theme.muted}`}>/{total} users</span>
        )}
      </p>

      {total !== undefined && (
        <>
          <p className="mt-4 text-base leading-snug opacity-90">
            {percent}% of all users are {role}s.
          </p>

          <svg viewBox="0 0 200 110" className="mt-6 w-full" aria-hidden="true">
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="currentColor"
              className={theme.track}
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="currentColor"
              className={theme.fill}
              strokeWidth="10"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${percent} 100`}
            />
            {Array.from({ length: 11 }).map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="22"
                x2="100"
                y2="28"
                stroke="currentColor"
                className={theme.muted}
                strokeWidth="1"
                transform={`rotate(${i * 18 - 90} 100 100)`}
              />
            ))}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="38"
              stroke="currentColor"
              className="text-white"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${needleAngle} 100 100)`}
            />
            <circle cx="100" cy="100" r="6" className="fill-white" />
            <text
              x="100"
              y="80"
              textAnchor="middle"
              className="fill-white text-[18px] font-semibold"
            >
              {count}
            </text>
          </svg>
        </>
      )}
    </div>
  )
}
