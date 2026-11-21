import type { Slot } from '#/modules/schedules/types/slot'
import { formatDate } from '#/utils/useDate'

export default function CalendarSlotButton({
  onSlotClick,
  slot,
}: {
  onSlotClick: ((slot: Slot) => void) | undefined
  slot: Slot
}) {
  return (
    <button
      type="button"
      className="w-full rounded-box border border-border p-4 text-left hover:bg-base-200"
      onClick={() => onSlotClick?.(slot)}
    >
      <span className="block font-medium text-slate-900">
        {formatDate(slot.start_at, 'p')} – {formatDate(slot.end_at, 'p')}
      </span>
      <span className="block text-xs text-slate-500">
        {slot.status}
        {slot.is_hidden ? ' · Hidden' : ''}
      </span>
    </button>
  )
}
