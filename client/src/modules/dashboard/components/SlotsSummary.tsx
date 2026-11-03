import { StatusStat } from '#/components/Decorator/StatusAscii'
import type { AdminStats } from '../api/dashboard'
import type { StatStatus } from '#/components/Decorator/StatusAscii'

interface SlotsSummaryProps {
  stats: AdminStats
}

export default function SlotsSummary({ stats }: SlotsSummaryProps) {
  return (
    <section className="bg-white border border-border rounded-md p-4 md:col-span-2 flex flex-col justify-between">
      <p className="font-bold mt-0">Slots</p>
      <div className="grid grid-cols-2 gap-4 mt-3">
        {(Object.entries(stats.slots) as [StatStatus, number][]).map(
          ([status, count]) => (
            <StatusStat key={status} count={count} status={status} showIcon />
          ),
        )}
      </div>
    </section>
  )
}
