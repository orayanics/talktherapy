import { formatDate } from '#/utils/useDate'

export default function ScheduleOccurrence({
  date,
  index,
}: {
  date: Date
  index: number
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-right font-mono text-neutral/60 shrink-0">
        {index + 1}
      </span>
      <div className="w-0.5 h-3.5 rounded-full shrink-0" />
      <span className="font-mono">{formatDate(date, 'PPp')}</span>
    </div>
  )
}
