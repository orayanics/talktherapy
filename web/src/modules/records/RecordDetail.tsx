import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { format, parseISO } from 'date-fns'
import type { RecordListItem } from '~/models/table'

interface RecordDetailProps {
  record: RecordListItem
}

interface SoapSectionProps {
  label: string
  content: string | null | undefined
}

function SoapSection({ label, content }: SoapSectionProps) {
  if (!content) return null
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-semibold uppercase tracking-wide opacity-50">
        {label}
      </h3>
      <div className="prose prose-sm max-w-none">
        <Markdown rehypePlugins={[rehypeRaw]}>{content}</Markdown>
      </div>
    </div>
  )
}

export default function RecordDetail({ record }: RecordDetailProps) {
  return (
    <div className="flex flex-col gap-6 p-4 border rounded-lg">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h2 className="text-lg font-semibold">Session Notes</h2>
        <p className="text-sm opacity-60">
          By <span className="font-medium">{record.clinician_name}</span>
          {' · '}
          {format(parseISO(record.created_at), 'MMMM d, yyyy')}
        </p>
        <span className="text-xs uppercase font-semibold opacity-50">
          {record.session_type}
        </span>
      </div>

      <SoapSection label="Activity Plan" content={record.activity_plan} />
      <SoapSection label="Subjective" content={record.subjective_notes} />
      <SoapSection label="Objective" content={record.objective_notes} />
      <SoapSection label="Assessment" content={record.assessment} />
      <SoapSection label="Recommendation" content={record.recommendation} />
      {record.comments && (
        <SoapSection label="Comments" content={record.comments} />
      )}
    </div>
  )
}
