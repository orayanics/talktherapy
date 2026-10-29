import { fetchAdminStats } from '#/modules/dashboard/api/dashboard'
import { useQuery } from '@tanstack/react-query'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'

export default function DashboardView() {
  const { data, isPending, isError } = useQuery(fetchAdminStats())

  if (isPending) return <StateLoading />
  if (isError) return <StateError />

  const stats = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="p-4 bg-white border border-slate-200 rounded-lg">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Total Users</h3>
          <div className="mt-3 text-3xl font-bold text-slate-800">{stats.users.total}</div>
        </section>
        <section className="p-4 bg-white border border-slate-200 rounded-lg">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            User Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-3">
            {Object.entries(stats.users.by_role).map(([role, count]) => (
              <div
                key={role}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className="text-xs font-mono text-slate-500 tracking-tight uppercase">
                  {role}
                </div>
                <div className="text-xl font-bold text-slate-800">{count}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="p-4 bg-white border border-slate-200 rounded-lg">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Slots</h3>
          <div className="grid grid-cols-2 gap-4 mt-3">
            {Object.entries(stats.slots).map(([status, count]) => (
              <div key={status} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-end"><div className="text-xs font-mono text-slate-500 uppercase">{status}</div><div className="text-xs font-bold text-slate-800">{count}</div></div>
              </div>
            ))}
          </div>
        </section>

        <section className="p-4 bg-white border border-slate-200 rounded-lg">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            Appointments
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-3">
            {Object.entries(stats.appointments).map(
              ([status, count]) => (
                <div
                  key={status}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div className="flex justify-between items-end">
                    <div className="text-xs font-mono text-slate-500 tracking-tight uppercase">
                      {status}
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {count}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
