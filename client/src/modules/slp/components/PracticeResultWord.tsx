import type { ReactNode } from 'react'

export default function PracticeResultWord({
  word,
  index,
  onRetry,
  children,
}: {
  word: string
  index: number
  onRetry: (index: number) => void
  children: ReactNode
}) {
  return (
    <li>
      <strong style={{ flex: 1 }}>{word}</strong>
      {children}
      <button
        type="button"
        className="tt-btn alt"
        style={{ padding: '6px 14px' }}
        onClick={() => onRetry(index)}
        aria-label={`Try ${word} again`}
      >
        Again
      </button>
    </li>
  )
}
