import ScheduleEditForm from '../ScheduleEditForm'
import type { ScheduleEditProps } from '~/models/components'
import PageTitle from '~/components/Page/PageTitle'

export default function ScheduleEdit({ data }: ScheduleEditProps) {
  return (
    <>
      <PageTitle
        brow="Scheduling"
        heading="Edit Schedule"
        subheading="Update your schedule details and slot configuration."
      />
      <ScheduleEditForm data={data} />
    </>
  )
}
