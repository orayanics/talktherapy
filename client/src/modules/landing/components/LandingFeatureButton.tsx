import type { LucideProps } from 'lucide-react'

export default function LandingFeatureButton({
  activeFeature,
  index,
  setActiveFeature,
  Icon,
  label,
}: {
  activeFeature: number
  index: number
  setActiveFeature: React.Dispatch<React.SetStateAction<number>>
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  label: string
}) {
  return (
    <button
      type="button"
      aria-pressed={activeFeature === index}
      aria-controls="hero-preview"
      onClick={() => setActiveFeature(index)}
    >
      <Icon size={17} aria-hidden="true" />
      {label}
    </button>
  )
}
