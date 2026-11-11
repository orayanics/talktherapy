import SummaryCard from './SummaryCard'

export default function UnavailableCard({
  label,
  detail,
}: {
  label: string
  detail: string
}) {
  return <SummaryCard label={label} value="—" detail={detail} />
}
