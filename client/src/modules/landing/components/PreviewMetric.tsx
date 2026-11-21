import { Check,FileText } from 'lucide-react'

export default function PreviewMetric({ label }: { label: string }) {
  return (
    <div>
      <FileText size={20} aria-hidden="true" />
      <span>{label}</span>
      <Check size={16} aria-hidden="true" />
    </div>
  )
}
