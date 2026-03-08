import PatientAppointments from './PatientAppointments'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

export default function PatientDashboard() {
  return (
    <>
      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          <PatientAppointments />
        </GridItem>
      </Grid>
    </>
  )
}
