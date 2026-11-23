import type { ReactNode } from 'react'
import type { CheckIn } from './PracticeRewards'

export default function PracticeCheckInOption({
  id,
  label,
  hint,
  className,
  shape,
  selected,
  shortcut,
  disabled,
  onPick,
}: {
  id: CheckIn | 'skip'
  label: string
  hint: string
  className: string
  shape: ReactNode
  selected: boolean
  shortcut: string
  disabled: boolean
  onPick: (value: CheckIn | 'skip') => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`tt-key ${className}`}
      aria-pressed={selected}
      aria-keyshortcuts={shortcut}
      onClick={() => onPick(id)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {shape}
      </svg>
      <span>
        {label}
        <small style={{ display: 'block', fontWeight: 600, opacity: 0.9 }}>
          {hint}
        </small>
      </span>
    </button>
  )
}
