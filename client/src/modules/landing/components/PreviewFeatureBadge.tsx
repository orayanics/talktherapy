import type { LucideProps } from 'lucide-react'

export default function PreviewFeatureBadge({
  feature,
  index,
  Icon,
  label,
}: {
  feature: number
  index: number
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  label: string
}) {
  return (
    <span className={index === feature ? 'is-active' : ''}>
      <Icon size={16} />
      {label}
    </span>
  )
}
