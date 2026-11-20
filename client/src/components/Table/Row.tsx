export function Row({
  label,
  value,
  children,
  textClassName,
}: {
  label: string
  value?: React.ReactNode
  children?: React.ReactNode
  textClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-muted font-semibold">{label}</span>
      {value && (
        <dd className={`${textClassName ? textClassName : ''}`}>{value}</dd>
      )}
      {children && <div className="ml-auto">{children}</div>}
    </div>
  )
}
