import type { UsersCount } from '@/api/users'
import { UserPlus, Users, UserX, UserMinus } from 'lucide-react'

export default function StatCards(props: UsersCount) {
  const { active_users, total, suspended_users, pending_users } = props

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
          count: active_users,
          icon: <UserPlus size={18} className="text-slate-900" />,
          trendColor: 'text-green-600',
        },
        {
          label: 'Pending users',
          count: pending_users,
          icon: <UserMinus size={18} className="text-slate-900" />,
          trendColor: 'text-green-600',
        },
        {
          label: 'Suspended users',
          count: suspended_users,
          icon: <UserX size={18} className="text-slate-900" />,
          trendColor: 'text-green-600',
        },
      ].map((stat, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col gap-3"
        >
          <div className="flex flex-row justify-between items-start">
            <div className="w-10 h-10 rounded-full border border-slate-200/60 bg-white flex items-center justify-center shadow-sm">
              {stat.icon}
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-[1.8rem] leading-none font-bold font-serif text-slate-900 tracking-tight">
                {stat.count}
              </h3>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
          </div>
        </div>
      ))}
    </>
  )
}
