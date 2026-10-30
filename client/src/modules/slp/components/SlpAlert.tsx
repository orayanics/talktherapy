import { Meh, Smile, Frown, CircleHelp } from 'lucide-react'
import type { SLP_OVERALL_STATUS } from '#/modules/slp/components/SlpPill'

const STATUS_STYLE_MAP: Record<SLP_OVERALL_STATUS, string> = {
  accurate: 'bg-green-50 text-green-700 border-green-200',
  mixed: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  needs_work: 'bg-red-50 text-red-700 border-red-200',
  unknown: 'bg-slate-100 text-slate-700 border-slate-300',
}

const STATUS_MESSAGE_MAP: Record<SLP_OVERALL_STATUS, string> = {
  accurate: 'The practice estimate was higher for this recording.',
  mixed: 'The practice estimate varied across this recording.',
  needs_work: 'The practice estimate suggests more practice may help.',
  unknown: 'This recording could not be scored reliably. Please try another recording.',
}

const STATUS_ICON_MAP: Record<SLP_OVERALL_STATUS, React.ReactNode> = {
  accurate: <Smile size={16} />,
  mixed: <Meh size={16} />,
  needs_work: <Frown size={16} />,
  unknown: <CircleHelp size={16} />,
}

type Props = {
  status: SLP_OVERALL_STATUS
}

export default function SlpAlert({ status }: Props) {
  const classes = STATUS_STYLE_MAP[status]
  const message = STATUS_MESSAGE_MAP[status]
  return (
    <div className={`alert alert-soft ${classes}`} role="status">
      {STATUS_ICON_MAP[status]}
      <p>{message}</p>
    </div>
  )
}
