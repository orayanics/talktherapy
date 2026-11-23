import { Check,Circle } from 'lucide-react'

export default function PracticeActionItem({
  done,
  label,
}: {
  done: boolean
  label: 'Recorded a turn' | 'Listened back' | 'Shared a check-in'
}) {
  return (
    <li data-done={done}>
      {done ? (
        <Check size={18} aria-hidden="true" />
      ) : (
        <Circle size={18} aria-hidden="true" />
      )}
      {label}
    </li>
  )
}
