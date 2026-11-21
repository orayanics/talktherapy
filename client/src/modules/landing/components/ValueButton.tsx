import type { LucideProps } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

export default function ValueButton({
  activeFeature,
  index,
  setActiveFeature,
  Icon,
  label,
  description,
}: {
  activeFeature: number
  index: number
  setActiveFeature: React.Dispatch<React.SetStateAction<number>>
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  label: string
  description: string
}) {
  return (
    <button
      type="button"
      aria-pressed={activeFeature === index}
      aria-controls="overview-preview"
      onClick={() => setActiveFeature(index)}
    >
      <span className="tt-feature-row">
        <Icon size={20} aria-hidden="true" />
        <span>{label}</span>
        <ArrowRight size={19} aria-hidden="true" />
      </span>
      {activeFeature === index && (
        <span className="tt-feature-description">{description}</span>
      )}
    </button>
  )
}
