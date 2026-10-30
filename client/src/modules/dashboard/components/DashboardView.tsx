import { fetchAdminStats } from '#/modules/dashboard/api/dashboard'
import { useQuery } from '@tanstack/react-query'
import StateLoading from '#/components/State/StateLoading'
import StateError from '#/components/State/StateError'
import HalfPieChart from './HalfPieChart'
import UserCard from './UserCard'

const diagnosisChartColors = [
  'rgb(0, 224, 176)',
  'rgb(38, 214, 100)',
  'rgb(128, 222, 42)',
  'rgb(222, 218, 32)',
  'rgb(255, 186, 24)',
  'rgb(255, 140, 40)',
  'rgb(255, 88, 72)',
  'rgb(240, 62, 122)',
  'rgb(206, 72, 190)',
  'rgb(164, 86, 240)',
  'rgb(102, 82, 236)',
]

export default function DashboardView() {
  const { data, isPending, isError } = useQuery(fetchAdminStats())

  if (isPending) return <StateLoading />
  if (isError) return <StateError />

  const stats = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="p-4 bg-white border border-slate-200 rounded-lg">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            User Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-3">
            {Object.entries(stats.users.by_role).map(([role, count]) => (
              <UserCard count={count} role={role} key={role} />
            ))}
          </div>
        </section>

        <section className="p-4 bg-white border border-slate-200 rounded-lg">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            Patients by Diagnosis
          </h3>
          <div className="mt-3">
            <HalfPieChart
              data={stats.users.by_diagnosis.map((diagnosis, index) => ({
                label: diagnosis.label,
                value: diagnosis.count,
                color:
                  diagnosisChartColors[index % diagnosisChartColors.length] ??
                  diagnosisChartColors[0],
              }))}
              smooth={false}
              glow={0}
              gap={2}
            />
          </div>
        </section>
        <section className="p-4 bg-white border border-slate-200 rounded-lg">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            Slots
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-3">
            {Object.entries(stats.slots).map(([status, count]) => (
              <div
                key={status}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg h-64"
              >
                <div className="flex justify-between items-end">
                  <div className="text-xs font-mono text-slate-500 uppercase">
                    {status}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="p-4 bg-white border border-slate-200 rounded-lg">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
            Appointments
          </h3>
          <div className="grid grid-cols-2 gap-4 mt-3">
            {Object.entries(stats.appointments).map(([status, count]) => (
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
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
