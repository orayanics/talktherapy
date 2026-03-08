import ScheduleForm from '../ScheduleForm'
import PageTitle from '~/components/Page/PageTitle'

export default function ScheduleCreate() {
  return (
    <div>
      <PageTitle
        brow="Scheduling"
        heading="New Schedule"
        subheading="Add a new slot to your schedule."
      />
      <ScheduleForm />
    </div>
  )
}
