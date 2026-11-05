import { cn } from '#/lib/cn'

export function DotGridIcon({ className }: { className: string }) {
  return (
    <div className="grid w-fit grid-cols-2 gap-0.5" aria-hidden="true">
      {['opacity-100', 'opacity-70', 'opacity-40', 'opacity-20'].map(
        (opacity) => (
          <span
            key={opacity}
            className={cn('size-2 rounded-full', className, opacity)}
          />
        ),
      )}
    </div>
  )
}

export default function StatCard({
  label,
  count,
  textClassName,
  dotClassName,
  showIcon,
  className,
}: {
  label: string
  count: number
  textClassName: string
  dotClassName: string
  showIcon?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-border px-4 py-2 text-xs font-medium',
        textClassName,
        className,
      )}
    >
      <span>{label}</span>
      <div className="inline-flex justify-between">
        {showIcon && <DotGridIcon className={dotClassName} />}
        <span className="text-xl font-semibold leading-none">{count}</span>
      </div>
    </div>
  )
}
