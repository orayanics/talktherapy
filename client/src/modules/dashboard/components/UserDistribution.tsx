import { Link } from '@tanstack/react-router'
import type { AdminStats } from '../api/dashboard'
import { RoleStat } from '#/components/Decorator/RoleAscii'

interface UserDistributionProps {
  stats: AdminStats
}

export default function UserDistribution({ stats }: UserDistributionProps) {
  return (
    <section className="bg-white border border-border rounded-md p-4 md:col-span-2 flex flex-col justify-between">
      <p className="font-bold mt-0">User Distribution</p>
      <div className="flex justify-between">
        <div>
          <p className="text-neutral my-0!">Total</p>
          <p className="font-bold text-4xl my-0!"> {stats.users.total}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {Object.entries(stats.users.by_role).map(([role, count]) => (
            <RoleStat count={count} role={role} key={role} showIcon />
          ))}
        </div>
      </div>

      <Link to="/users" className="btn btn-neutral w-full mt-4">
        View Users
      </Link>
    </section>
  )
}
