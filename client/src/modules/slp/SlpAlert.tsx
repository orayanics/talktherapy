import { Meh, Smile, Frown } from 'lucide-react'
import type { SLP_STATUS } from '@/components/Decorator/SlpPill'

const STATUS_STYLE_MAP: Record<SLP_STATUS, string> = {
  accurate: 'bg-green-50 text-green-700 border-green-200',
  mixed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  needs_work: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_MESSAGE_MAP: Record<SLP_STATUS, string> = {
  accurate: 'Great job! Your pronunciation is accurate.',
  mixed: 'Not bad! Some parts are accurate, but there are areas to improve.',
  needs_work: 'Keep practicing! Your pronunciation needs work.',
}

const STATUS_ICON_MAP: Record<SLP_STATUS, React.ReactNode> = {
  accurate: <Smile size={16} />,
  mixed: <Meh size={16} />,
  needs_work: <Frown size={16} />,
}

type Props = {
  status: SLP_STATUS
}

export default function SlpAlert({ status }: Props) {
  const classes = STATUS_STYLE_MAP[status]
  const message = STATUS_MESSAGE_MAP[status]
  return (
    <div className={`alert alert-soft ${classes}`}>
      {STATUS_ICON_MAP[status]}
      <p>{message}</p>
    </div>
  )
}
