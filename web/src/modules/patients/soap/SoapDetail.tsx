import { format, parseISO } from 'date-fns'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import type { SoapDto } from '~/models/booking'

interface SoapDetailViewProps {
  soap: SoapDto
}

const SOAP_FIELDS: Array<{ label: string; key: keyof SoapDto }> = [
  { label: 'Session Type', key: 'session_type' },
  { label: 'Activity Plan', key: 'activity_plan' },
  { label: 'Subjective Notes', key: 'subjective_notes' },
  { label: 'Objective Notes', key: 'objective_notes' },
  { label: 'Assessment', key: 'assessment' },
  { label: 'Recommendation', key: 'recommendation' },
  { label: 'Comments', key: 'comments' },
]

export default function SoapDetail({ soap }: SoapDetailViewProps) {
  return (
    <div className="flex flex-col gap-4 overflow-auto max-h-200 bg-white rounded-lg border p-6">
      <div className="flex flex-col gap-1 border-b border-dashed border-gray-200 pb-4">
        <p className="font-bold uppercase text-primary text-sm">SOAP Record</p>
        <p className="text-xs text-gray-400">
          Created {format(parseISO(soap.created_at), 'MMMM d, yyyy')}
        </p>
      </div>

      {SOAP_FIELDS.map(({ label, key }) => {
        const value = soap[key]
        if (!value) return null
        return (
          <div
            key={key}
            className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-100 last:border-b-0"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {label}
            </p>
            <div className=" text-gray-800 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3">
              <div className="prose prose-sm max-w-none">
                <Markdown rehypePlugins={[rehypeRaw]}>{value}</Markdown>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
