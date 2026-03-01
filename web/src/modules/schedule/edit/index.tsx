import ScheduleEditForm from '../ScheduleEditForm'
import type { AvailabilityRuleWithSlots } from '~/models/schedule'
import PageTitle from '~/components/Page/PageTitle'

interface ScheduleEditProps {
  data: AvailabilityRuleWithSlots
}

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
