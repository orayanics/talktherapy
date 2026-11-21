export default function PracticeActivityStat({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
