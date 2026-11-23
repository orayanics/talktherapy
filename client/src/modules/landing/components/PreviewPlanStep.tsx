import { BookOpen } from 'lucide-react';

export default function PreviewPlanStep({ index, title }: { index: number; title: string }) {
  return (
    <div>
      <BookOpen size={25} aria-hidden="true" />
      <div>
        <small>EXAMPLE RESOURCE {index + 1}</small>
        <h4>{title}</h4>
      </div>
    </div>
  )
}
