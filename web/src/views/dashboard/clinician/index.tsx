// import Grid from '~/components/Page/Grid'
// import GridItem from '~/components/Page/GridItem'
import type { AppointmentStatsCardProps } from '~/models/components'

export default function Index() {
  return (
    <>
      <h1>Clinician</h1>
      <AppointmentStatsCard />
    </>
  )
}

function AppointmentStatsCard({ appointments }: AppointmentStatsCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border">
      {appointments ? (
        <>
          <h2 className="font-medium text-gray-600">Upcoming Appointments</h2>
          <p className="text-2xl font-semibold">{appointments}</p>
        </>
      ) : (
        <h2 className="font-medium text-gray-600">No Appointments</h2>
      )}
    </div>
  )
}
