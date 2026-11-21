import type { UsersCount } from '#/modules/users/types/user'
import { UserPlus, Users, UserX, UserMinus } from 'lucide-react'
import StatCardItem from './StatCardItem'

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
        <StatCardItem
          key={i}
          label={stat.label}
          count={stat.count}
          icon={stat.icon}
        />
      ))}
    </>
  )
}
