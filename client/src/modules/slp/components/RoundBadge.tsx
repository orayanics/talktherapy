import type { LucideProps } from 'lucide-react'

export default function RoundBadge({
  badge,
}: {
  badge: {
    earned: boolean
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
    >
    name: string
    detail: string
  }
}) {
  return (
    <li>
      <badge.icon size={24} aria-hidden="true" />
      <div>
        <strong>{badge.name}</strong>
        <span>{badge.detail}</span>
      </div>
    </li>
  )
}
