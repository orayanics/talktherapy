import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, startOfDay } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import type { CalenderSingleDropdownProps } from '~/models/components'

export default function CalenderSingleDropdown(
  props: CalenderSingleDropdownProps,
) {
  const {
    date,
    onSelect,
    disablePast = true,
    placeholder = 'Pick a date',
  } = props
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(undefined)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="input input-bordered w-full flex items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2">
          <Calendar className="opacity-50 shrink-0" />
          {date ? (
            <span>{format(date, 'MMM d, yyyy')}</span>
          ) : (
            <span className="opacity-50">{placeholder}</span>
          )}
        </span>
        {date && (
          <Clock
            className="opacity-50 hover:opacity-100 shrink-0"
            onClick={handleClear}
          />
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-base-100 border rounded-lg shadow-lg">
          <DayPicker
            className="react-day-picker"
            classNames={{
              months: 'min-w-full',
              month_grid: 'mx-auto',
              day_button:
                'p-2 rounded-lg hover:text-primary hover:bg-primary/10',
              selected: 'font-bold text-primary rounded-lg',
            }}
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={
              disablePast ? { before: startOfDay(new Date()) } : undefined
            }
          />
        </div>
      )}
    </div>
  )
}
