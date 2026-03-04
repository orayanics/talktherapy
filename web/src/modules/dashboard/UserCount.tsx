import { resolveStatus } from './dashboard'
import type { DashboardCount, DashboardStatusCount } from '~/models/dashboard'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import { ACCOUNT_STATUS_TEXT } from '~/config/accountStatus'

function StatusBreakdown({ status }: { status: DashboardStatusCount }) {
  const entries = Object.entries(status) as Array<
    [keyof DashboardStatusCount, number]
  >
  return (
    <div className="mt-4">
      <ul className="mt-2 space-y-1 text-sm text-gray-700">
        {entries.map(([label, count]) => {
          const style = ACCOUNT_STATUS_TEXT[label]
          return (
            <li key={label} className="capitalize">
              <p className={`${style} text-right`}>
                <span>{label}</span>{' '}
                <span className="text-stone-400">{count}</span>
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function UserCount(data: DashboardCount['data']) {
  const {
    total,
    patients,
    clinicians,
    admins,
    patientStatusCount,
    clinicianStatusCount,
    adminStatusCount,
  } = data

  const COUNT_ITEMS = [
    { key: 'totalUsers', title: 'Total Users', count: total, status: null },
    {
      key: 'patients',
      title: 'Patients',
      count: patients,
      status: resolveStatus(patientStatusCount),
    },
    {
      key: 'clinicians',
      title: 'Clinicians',
      count: clinicians,
      status: resolveStatus(clinicianStatusCount),
    },
    {
      key: 'admins',
      title: 'Admins',
      count: admins,
      status: resolveStatus(adminStatusCount),
    },
  ]

  return (
    <Grid
      cols={12}
      gap={4}
      className="rounded-lg [&>div]:bg-white [&>div]:p-4 [&>div]:rounded-lg [&>div]:border
      [&>div>h2]:font-medium [&>div>h2]:text-gray-600 [&>div>p]:text-2xl [&>div>p]:font-semibold"
    >
      {COUNT_ITEMS.map((item) => (
        <GridItem
          key={item.key}
          colSpan={12}
          className={`lg:col-span-3 ${item.key === 'totalUsers' ? 'order-first lg:order-0' : ''}`}
        >
          <h2>{item.title}</h2>
          <p>{item.count}</p>
          {item.status && <StatusBreakdown status={item.status} />}
        </GridItem>
      ))}
    </Grid>
  )
}
