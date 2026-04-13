import { prettyPrintJson } from 'pretty-print-json'

interface LogDetailProps {
  details: unknown
}

function parseDetails(details: unknown) {
  if (typeof details !== 'string') return details
  try {
    return JSON.parse(details)
  } catch {
    return details
  }
}

export default function LogDetail({ details }: LogDetailProps) {
  const parsed = parseDetails(details)
  return (
    <div
      className="text-xs max-h-64 overflow-auto bg-base-100 p-2 rounded border border-base-300"
      dangerouslySetInnerHTML={{
        __html: prettyPrintJson.toHtml(parsed),
      }}
    />
  )
}
