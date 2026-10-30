import { Star } from 'lucide-react'

export default function PracticeStars({
  earned,
  total = 3,
}: {
  earned: number
  total?: number
}) {
  return (
    <span
      className="slp-stars"
      role="img"
      aria-label={`${earned} of ${total} practice stars earned`}
    >
      {Array.from({ length: total }, (_, index) => (
        <Star
          key={index}
          size={26}
          aria-hidden="true"
          className={index < earned ? 'slp-star-earned' : 'slp-star-empty'}
          fill={index < earned ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  )
}
