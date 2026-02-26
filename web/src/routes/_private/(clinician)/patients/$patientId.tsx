import { createFileRoute } from '@tanstack/react-router'

import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

import PageTitle from '~/components/Page/PageTitle'
import PatientInfo from '~/modules/patients/PatientInfo'

export const Route = createFileRoute(
  '/_private/(clinician)/patients/$patientId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <PageTitle
        heading={'Patient Overview'}
        subheading={'View patient profile and manage actions.'}
      />

      <Grid cols={8} gap={6} className="w-auto lg:w-200">
        <GridItem colSpan={8} className="flex flex-col gap-4 order-1">
          <PatientInfo />

          <div className="flex flex-col gap-2 col-span-12">
            <button className="btn btn-primary">Add SOAP</button>
            <button className="btn btn-primary">View Progress</button>
            <button className="btn btn-primary">View Records</button>
            <button className="btn btn-primary">Request Records</button>
            <button className="btn btn-primary">Export Data</button>
          </div>
        </GridItem>
      </Grid>
    </>
  )
}
