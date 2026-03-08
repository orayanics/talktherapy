import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'

import ScheduleEdit from '~/modules/schedule/edit'
import { availabilityByIdQuery } from '~/api/scheduling'
import { useAuthGuard } from '~/hooks/useAuthGuard'

export const Route = createFileRoute(
  '/_private/(shared)/schedules/$scheduleId_/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { is } = useAuthGuard()
  const isClinician = is('clinician')

  if (!isClinician) {
    const navigate = useNavigate()
    navigate({
      to: '/schedules',
    })
  }

  const { scheduleId } = Route.useParams()
  const { data, isLoading, isError } = useQuery(
    availabilityByIdQuery(scheduleId),
  )

  return (
    <>
      {isLoading ? (
        <LoaderTable />
      ) : isError ? (
        <SkeletonError />
      ) : data ? (
        <ScheduleEdit data={data} />
      ) : (
        <SkeletonNull />
      )}
    </>
  )
}
