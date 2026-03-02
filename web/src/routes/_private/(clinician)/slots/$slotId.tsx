import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import PageTitle from '~/components/Page/PageTitle'
import Grid from '~/components/Page/Grid'
import GridItem from '~/components/Page/GridItem'
import SkeletonError from '~/components/Skeleton/SkeletonError'
import LoaderTable from '~/components/Loader/LoaderTable'
import SkeletonNull from '~/components/Skeleton/SkeletonNull'

import {
  clinicianSlotAppointmentQuery,
  useUnblockSlot,
} from '~/api/appointments'
import AppointmentDetail from '~/modules/appointment/detail/AppointmentDetail'

export const Route = createFileRoute('/_private/(clinician)/slots/$slotId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { slotId } = Route.useParams()

  const { data, isLoading, error } = useQuery(
    clinicianSlotAppointmentQuery(slotId),
  )

  const unblockSlot = useUnblockSlot(slotId)

  const showUnblock =
    data?.status === 'CANCELLED' && data?.slot?.status === 'BLOCKED'

  return (
    <>
      <PageTitle
        heading="Appointment Overview"
        subheading="Review patient intake details and manage this appointment."
      />

      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          {isLoading && <LoaderTable />}
          {!isLoading && !error && !data && <SkeletonNull />}
          {error && <SkeletonError />}
          {data && <AppointmentDetail appointment={data} />}
          {showUnblock && (
            <div className="flex flex-row justify-end pt-2 border-t border-dashed border-gray-200">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={unblockSlot.isPending}
                onClick={() => unblockSlot.mutate()}
              >
                {unblockSlot.isPending ? 'Unblocking…' : 'Unblock Slot'}
              </button>
            </div>
          )}
        </GridItem>
      </Grid>
    </>
  )
}
