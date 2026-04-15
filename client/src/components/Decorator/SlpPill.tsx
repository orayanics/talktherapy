export type SLP_STATUS = 'accurate' | 'mixed' | 'needs_work'

type Props = {
  status: SLP_STATUS
}

const STATUS_STYLE_MAP: Record<SLP_STATUS, string> = {
  accurate: 'bg-green-50 text-green-700 border-green-200',
  mixed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  needs_work: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_LABEL_MAP: Record<SLP_STATUS, string> = {
  accurate: 'Accurate',
  mixed: 'Mixed',
  needs_work: 'Needs work',
}

export default function SlpPill({ status }: Props) {
  const classes = STATUS_STYLE_MAP[status]
  const label = STATUS_LABEL_MAP[status]

  return (
    <div className={`badge badge-sm font-bold border uppercae ${classes}`}>
      {label}
    </div>
  )
}
