import type { UsersCount } from '#/modules/users/types/user'
import { UserPlus, Users, UserX, UserMinus } from 'lucide-react'

export default function StatCards(props: UsersCount) {
  const { active, total, suspended, pending } = props

  return (
    <>
      {[
        {
          label: 'Total users',
          count: total,
          icon: <Users size={18} className="text-slate-900" />,
          trendColor: 'text-green-600',
        },
        {
          label: 'Active users',
          count: active,
          icon: <UserPlus size={18} className="text-slate-900" />,
          trendColor: 'text-green-600',
        },
        {
          label: 'Pending users',
          count: pending,
          icon: <UserMinus size={18} className="text-slate-900" />,
          trendColor: 'text-green-600',
        },
        {
          label: 'Suspended users',
          count: suspended,
          icon: <UserX size={18} className="text-slate-900" />,
          trendColor: 'text-green-600',
        },
      ].map((stat, i) => (
        <div
          key={i}
          className="bg-white rounded-box border border-border p-4 flex flex-col gap-4"
        >
          <div className="flex flex-row gap-4 items-center">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
              {stat.icon}
            </div>

            <p className="text-base-content text-sm font-medium my-0!">
              {stat.label}
            </p>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold">{stat.count}</span>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
