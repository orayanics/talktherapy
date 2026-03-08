import { DayPicker } from 'react-day-picker'
import { format, startOfDay } from 'date-fns'
import type { CalenderSingleProps } from '~/models/components'

export default function CalenderSingle(props: CalenderSingleProps) {
  const { date, onSelect, disablePast = true } = props
  const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return
    onSelect(selectedDate)
  }

  return (
    <DayPicker
      className="react-day-picker bg-white"
      classNames={{
        months: 'min-w-full',
        month_grid: 'mx-auto',
        day_button: 'p-2 rounded-lg hover:text-primary hover:bg-primary/10',
        selected: 'font-bold text-primary rounded-lg',
      }}
      mode="single"
      selected={date}
      onSelect={handleSelect}
      disabled={disablePast ? { before: startOfDay(new Date()) } : undefined}
      footer={date ? `Selected: ${dateStr}` : 'Pick a day.'}
    />
  )
}
