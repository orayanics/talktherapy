import { createFileRoute } from '@tanstack/react-router'

import { useQuery } from '@tanstack/react-query'
import PageTitle from '~/components/Page/PageTitle'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'

import ScheduleDetailsId from '~/modules/schedule/id/ScheduleInfo'
import ScheduleSlot from '~/modules/schedule/id/ScheduleSlot'
import { availabilityByIdQuery } from '~/api/scheduling'

export const Route = createFileRoute(
  '/_private/(shared)/schedules/$scheduleId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { scheduleId } = Route.useParams()
  const {
    data = [],
    isLoading,
    error,
  } = useQuery(availabilityByIdQuery(scheduleId))

  {
    !isLoading && !error && !data && <SkeletonNull />
  }
  if (isLoading) return <LoaderTable />
  if (error) return <SkeletonError />

  return (
    <>
      <PageTitle
        heading="Schedule Overview"
        subheading="View schedule details and appointment information."
      />

      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-6">
          <ScheduleDetailsId data={data} />
        </GridItem>

        <GridItem colSpan={12} className="flex flex-col gap-4 lg:col-span-6">
          <ScheduleSlot data={data} />
        </GridItem>
      </Grid>
    </>
  )
}
